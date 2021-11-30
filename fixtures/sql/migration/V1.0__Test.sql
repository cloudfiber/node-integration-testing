CREATE TABLE test
(
    id             INT2 PRIMARY KEY,
    varchar_column VARCHAR,
    numeric_column NUMERIC,
    common         NUMERIC
);

INSERT INTO test
VALUES (1, 'VARCHAR_1', 1, 1);
INSERT INTO test
VALUES (2, 'VARCHAR_2', 2, 1);
INSERT INTO test
VALUES (3, 'VARCHAR_3', 3, 1);