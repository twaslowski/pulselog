INSERT INTO metric (name, description, labels, owner_id, metric_type, min_value, max_value)
VALUES ('Energy',
        'How much energy do you have?',
        '{}'::jsonb,
        'SYSTEM',
        'continuous',
        0, 10);

INSERT INTO metric (name, description, labels, owner_id, metric_type, min_value, max_value)
VALUES ('Appetite',
        'How much appetite do you have?',
        '{"None": 0, "Not a lot": 1, "Normal": 2, "A lot": 3, "I am starving": 4}'::jsonb,
        'SYSTEM',
        'discrete', 0, 4);

INSERT INTO metric (name, description, labels, owner_id, metric_type, min_value, max_value)
VALUES ('Stress',
        'How stressed are you?',
        '{}'::jsonb,
        'SYSTEM',
        'continuous',
        0, 5);