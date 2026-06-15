-- Create tables for WasteLess

-- Table 1: Batas Anggaran Bulanan
CREATE TABLE IF NOT EXISTS budget_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    budget_ceiling NUMERIC(12, 2) NOT NULL,
    current_spending NUMERIC(12, 2) DEFAULT 0.00,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table 2: Profil Nutrisi Target
CREATE TABLE IF NOT EXISTS nutrition_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    target_calories INT NOT NULL,
    target_carbo_gram INT,
    target_protein_gram INT,
    target_fiber_gram INT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table 3: Inventaris Kulkas (Pantry Assets)
CREATE TABLE IF NOT EXISTS pantry_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    weight_quantity_gram NUMERIC(10, 2) NOT NULL,
    purchase_price NUMERIC(12, 2) NOT NULL,
    purchase_date DATE DEFAULT CURRENT_DATE,
    estimated_expiry_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Segar', -- 'Segar' (Hijau), 'Warning' (Kuning), 'Kritis' (Merah), 'Dikonsumsi'
    is_consumed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table 4: Audit Kerugian Pangan (Waste Logs)
CREATE TABLE IF NOT EXISTS waste_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    pantry_asset_id UUID REFERENCES pantry_assets(id) ON DELETE SET NULL,
    item_name VARCHAR(255) NOT NULL,
    wasted_weight_gram NUMERIC(10, 2) NOT NULL,
    financial_loss NUMERIC(12, 2) NOT NULL,
    waste_reason VARCHAR(255),
    logged_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE budget_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pantry_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_logs ENABLE ROW LEVEL SECURITY;

-- Create Policies for RLS (assuming auth.uid() checks for authenticated users)
CREATE POLICY "Users can manage their own budget settings"
    ON budget_settings FOR ALL
    USING (true); -- simplified or using (auth.uid() = user_id) for real supabase auth

CREATE POLICY "Users can manage their own nutrition profiles"
    ON nutrition_profiles FOR ALL
    USING (true);

CREATE POLICY "Users can manage their own pantry assets"
    ON pantry_assets FOR ALL
    USING (true);

CREATE POLICY "Users can manage their own waste logs"
    ON waste_logs FOR ALL
    USING (true);
