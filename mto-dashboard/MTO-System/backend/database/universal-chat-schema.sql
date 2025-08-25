-- Universal Chat System Schema
-- Smart ID-based chat architecture for all contexts

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main chat rooms table with smart IDs
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Smart Universal ID (e.g., "MTO_SP_37483586", "MTO_MO_2025_01", "INV_129559")
  chat_id VARCHAR(255) UNIQUE NOT NULL,
  
  -- Parsed components for efficient querying
  chat_type VARCHAR(20) GENERATED ALWAYS AS (split_part(chat_id, '_', 1)) STORED,
  chat_level VARCHAR(20) GENERATED ALWAYS AS (
    CASE 
      WHEN split_part(chat_id, '_', 2) IN ('SP', 'DY', 'MO', 'YR') THEN split_part(chat_id, '_', 2)
      ELSE NULL
    END
  ) STORED,
  
  -- Room metadata (flexible JSON for any chat type)
  metadata JSONB DEFAULT '{}',
  
  -- Room settings
  is_active BOOLEAN DEFAULT TRUE,
  is_archived BOOLEAN DEFAULT FALSE,
  
  -- Statistics
  participant_count INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  unread_count INTEGER DEFAULT 0,
  
  -- Timestamps
  last_activity TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Note: Indexes will be created separately after table creation
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id VARCHAR(255) NOT NULL REFERENCES chat_rooms(chat_id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  
  -- Message content
  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system', 'notification')),
  
  -- Rich content
  attachments JSONB DEFAULT '[]',
  mentions UUID[] DEFAULT '{}', -- Array of mentioned user IDs
  
  -- Threading
  parent_message_id UUID REFERENCES chat_messages(id),
  
  -- Status
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Note: Indexes will be created separately after table creation
);

-- Chat participants/subscriptions
CREATE TABLE IF NOT EXISTS chat_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id VARCHAR(255) NOT NULL REFERENCES chat_rooms(chat_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Participation details
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  
  -- Read status
  last_read_at TIMESTAMP,
  last_read_message_id UUID REFERENCES chat_messages(id),
  unread_count INTEGER DEFAULT 0,
  
  -- Notification preferences
  notifications_enabled BOOLEAN DEFAULT TRUE,
  notification_type VARCHAR(20) DEFAULT 'all' CHECK (notification_type IN ('all', 'mentions', 'none')),
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  joined_at TIMESTAMP DEFAULT NOW(),
  left_at TIMESTAMP,
  
  -- Unique constraint
  UNIQUE(chat_id, user_id),
  
  -- Note: Indexes will be created separately after table creation
);

-- Message read receipts
CREATE TABLE IF NOT EXISTS message_read_receipts (
  message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMP DEFAULT NOW(),
  
  PRIMARY KEY (message_id, user_id)
  -- Note: Indexes will be created separately after table creation
);

-- Chat ID patterns reference table (for documentation)
CREATE TABLE IF NOT EXISTS chat_id_patterns (
  pattern VARCHAR(100) PRIMARY KEY,
  description TEXT,
  example VARCHAR(255),
  auto_subscribe_rules JSONB DEFAULT '{}'
);

-- Insert chat ID pattern documentation
INSERT INTO chat_id_patterns (pattern, description, example, auto_subscribe_rules) VALUES
('MTO_SP_{mto_id}', 'Specific MTO discussion', 'MTO_SP_37483586', '{"roles": ["brand_user", "factory_assignee", "qc_inspector"]}'),
('MTO_DY_{yyyy}_{mm}_{dd}', 'All MTOs for a specific day', 'MTO_DY_2025_01_24', '{"roles": ["production_manager", "brand_supervisor"]}'),
('MTO_MO_{yyyy}_{mm}', 'All MTOs for a month', 'MTO_MO_2025_01', '{"roles": ["executive", "manager"]}'),
('MTO_YR_{yyyy}', 'All MTOs for a year', 'MTO_YR_2025', '{"roles": ["executive"]}'),
('INV_{sku}', 'Inventory item discussion', 'INV_129559', '{"roles": ["warehouse_team", "procurement"]}'),
('DEF_{defect_id}_MTO_{mto_id}', 'Defect linked to MTO', 'DEF_QC001_MTO_37483586', '{"roles": ["qc_team", "production_manager"]}'),
('SHIP_{carton}_{tracking}', 'Shipping/carton discussion', 'SHIP_MC0001_DHL123456', '{"roles": ["logistics", "customs_broker"]}'),
('PO_{po_number}', 'Purchase order discussion', 'PO_PO123', '{"roles": ["buyer", "account_manager"]}')
ON CONFLICT (pattern) DO NOTHING;

-- Helper functions
CREATE OR REPLACE FUNCTION get_chat_hierarchy(p_chat_id VARCHAR)
RETURNS TABLE (
  level INTEGER,
  chat_id VARCHAR,
  chat_type VARCHAR,
  description TEXT
) AS $$
BEGIN
  -- Return hierarchical chats related to the input chat_id
  RETURN QUERY
  WITH parsed AS (
    SELECT 
      p_chat_id as original_id,
      split_part(p_chat_id, '_', 1) as type,
      split_part(p_chat_id, '_', 2) as level
  )
  SELECT 
    CASE 
      WHEN cr.chat_id = p_chat_id THEN 0
      WHEN cr.chat_level = 'MO' THEN 1
      WHEN cr.chat_level = 'DY' THEN 2
      WHEN cr.chat_level = 'SP' THEN 3
      ELSE 4
    END as level,
    cr.chat_id,
    cr.chat_type,
    cr.metadata->>'description' as description
  FROM chat_rooms cr, parsed p
  WHERE cr.chat_type = p.type
    AND (
      cr.chat_id = p_chat_id OR
      (p.level = 'SP' AND cr.chat_id LIKE p.type || '_DY_%') OR
      (p.level = 'SP' AND cr.chat_id LIKE p.type || '_MO_%') OR
      (p.level = 'DY' AND cr.chat_id LIKE p.type || '_MO_%')
    )
  ORDER BY level;
END;
$$ LANGUAGE plpgsql;

-- Update room statistics trigger
CREATE OR REPLACE FUNCTION update_room_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE chat_rooms 
    SET 
      message_count = message_count + 1,
      last_activity = NEW.created_at
    WHERE chat_id = NEW.chat_id;
    
    -- Update unread counts for all participants except sender
    UPDATE chat_participants
    SET unread_count = unread_count + 1
    WHERE chat_id = NEW.chat_id
      AND user_id != NEW.sender_id
      AND is_active = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_room_stats_on_message
AFTER INSERT ON chat_messages
FOR EACH ROW EXECUTE FUNCTION update_room_stats();

-- Update participant count trigger
CREATE OR REPLACE FUNCTION update_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_rooms
  SET participant_count = (
    SELECT COUNT(*)
    FROM chat_participants
    WHERE chat_id = COALESCE(NEW.chat_id, OLD.chat_id)
      AND is_active = TRUE
  )
  WHERE chat_id = COALESCE(NEW.chat_id, OLD.chat_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_participant_count_on_change
AFTER INSERT OR UPDATE OR DELETE ON chat_participants
FOR EACH ROW EXECUTE FUNCTION update_participant_count();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_type ON chat_rooms(chat_type);
CREATE INDEX IF NOT EXISTS idx_chat_level ON chat_rooms(chat_level);
CREATE INDEX IF NOT EXISTS idx_chat_id_pattern ON chat_rooms(chat_id text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_active_rooms ON chat_rooms(is_active, last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_chat_created ON chat_rooms(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages ON chat_messages(chat_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sender_messages ON chat_messages(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_parent_thread ON chat_messages(parent_message_id) WHERE parent_message_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_chats ON chat_participants(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_chat_participants ON chat_participants(chat_id, is_active);

CREATE INDEX IF NOT EXISTS idx_user_reads ON message_read_receipts(user_id, read_at DESC);

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;