-- Initial seed data for testing the WasteLess application

-- Insert mock budget settings
INSERT INTO budget_settings (user_id, budget_ceiling, current_spending, start_date, end_date)
VALUES 
('d0c11f7a-8b8a-4933-87b6-c67d643db8e0', 1000000.00, 480000.00, '2026-06-01', '2026-06-30');

-- Insert mock nutrition profile
INSERT INTO nutrition_profiles (user_id, target_calories, target_carbo_gram, target_protein_gram, target_fiber_gram)
VALUES 
('d0c11f7a-8b8a-4933-87b6-c67d643db8e0', 2100, 300, 75, 30);

-- Insert mock pantry assets (FIFO test data)
INSERT INTO pantry_assets (id, user_id, item_name, category, weight_quantity_gram, purchase_price, purchase_date, estimated_expiry_date, status, is_consumed)
VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd0c11f7a-8b8a-4933-87b6-c67d643db8e0', 'Daging Sapi', 'Daging', 500, 70000.00, '2026-06-02', '2026-06-05', 'Kritis', false),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'd0c11f7a-8b8a-4933-87b6-c67d643db8e0', 'Bayam', 'Sayur', 200, 5000.00, '2026-06-02', '2026-06-06', 'Warning', false),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'd0c11f7a-8b8a-4933-87b6-c67d643db8e0', 'Telur Ayam', 'Telur', 480, 24000.00, '2026-06-01', '2026-06-15', 'Segar', false),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'd0c11f7a-8b8a-4933-87b6-c67d643db8e0', 'Susu UHT', 'Susu', 1000, 18000.00, '2026-06-01', '2026-06-08', 'Segar', false);

-- Insert mock waste logs
INSERT INTO waste_logs (user_id, pantry_asset_id, item_name, wasted_weight_gram, financial_loss, waste_reason)
VALUES 
('d0c11f7a-8b8a-4933-87b6-c67d643db8e0', NULL, 'Sayur Kangkung', 150, 4500.00, 'Membusuk'),
('d0c11f7a-8b8a-4933-87b6-c67d643db8e0', NULL, 'Daging Ayam', 300, 22000.00, 'Melewati Kedaluwarsa');
