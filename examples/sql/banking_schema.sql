CREATE TABLE core.customers (
    customer_id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(100),
    kyc_status VARCHAR(20)
);

CREATE TABLE core.accounts (
    account_id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50),
    balance NUMERIC(15, 2),
    CONSTRAINT fk_cust FOREIGN KEY (customer_id) REFERENCES core.customers(customer_id)
);
