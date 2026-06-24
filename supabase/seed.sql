INSERT INTO metric (name, description, labels, owner_id, metric_type, min_value, max_value)
VALUES ('Mood',
        'Daily mood rating',
        '{"Severely Depressed": -3, "Depressed": -2, "Slightly Depressed": -1, "Neutral": 0, "Slightly Manic": 1, "Manic": 2, "Severely Manic": 3}'::jsonb,
        'SYSTEM',
        'discrete',
        -3, 3)
ON CONFLICT (name, owner_id) DO UPDATE
    SET description  = EXCLUDED.description,
        labels       = EXCLUDED.labels,
        metric_type  = EXCLUDED.metric_type,
        min_value    = EXCLUDED.min_value,
        max_value    = EXCLUDED.max_value;

INSERT INTO metric (name, description, labels, owner_id, metric_type, min_value, max_value)
VALUES ('Sleep',
        'Total hours of sleep per night',
        '{}'::jsonb,
        'SYSTEM',
        'continuous',
        0, 16)
ON CONFLICT (name, owner_id) DO UPDATE
    SET description  = EXCLUDED.description,
        labels       = EXCLUDED.labels,
        metric_type  = EXCLUDED.metric_type,
        min_value    = EXCLUDED.min_value,
        max_value    = EXCLUDED.max_value;

INSERT INTO tracking_default (metric_id, baseline)
SELECT id, 0
FROM metric
WHERE name = 'Mood' AND owner_id = 'SYSTEM'
ON CONFLICT (metric_id) DO UPDATE
    SET baseline = EXCLUDED.baseline;

INSERT INTO tracking_default (metric_id, baseline)
SELECT id, 8
FROM metric
WHERE name = 'Sleep' AND owner_id = 'SYSTEM'
ON CONFLICT (metric_id) DO UPDATE
    SET baseline = EXCLUDED.baseline;