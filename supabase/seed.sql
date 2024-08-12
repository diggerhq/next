-- Insert into products table
INSERT INTO products (id, active, name, description, image, metadata)
VALUES (
    'prod_QeConsGHaqO915',
    TRUE,
    'Digger Team (Test Mode) ( Early adopter pricing)',
    'Test mode Digger Team (Early adopter pricing)',
    NULL,
    '{}'::jsonb
  );

-- Insert into prices table
INSERT INTO prices (
    id,
    product_id,
    active,
    description,
    unit_amount,
    currency,
    TYPE,
    INTERVAL,
    interval_count,
    trial_period_days,
    metadata
  )
VALUES (
    'price_1PmuOeL2vgF62ZxUC2CZYCQT',
    'prod_QeConsGHaqO915',
    TRUE,
    'Test mode price',
    29900,
    'gbp',
    'recurring',
    'month',
    1,
    NULL,
    '{}'::jsonb
  );