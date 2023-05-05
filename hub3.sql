DROP TABLE IF EXISTS adress;
CREATE TABLE adress (
    address_id INTEGER,
    street text not null,
    city text not null,
    stte text not null,
    zip_code int check(length(zip_code)=5),
    CONSTRAINT addr_id_pk PRIMARY KEY(address_id),
    UNIQUE (street, city, stte)
);

DROP TABLE IF EXISTS business;
CREATE TABLE business (
    business_id INTEGER,
    username text not null,
    passwrd text not null,
    email text not null,
    b_name text not null,
    phone text(10) not null,
    o_hours text not null,
    c_hours time not null,
    address_id int references adress(address_id)
      on update cascade
      on delete set null,
    CONSTRAINT bus_id_pk PRIMARY KEY(business_id),
    UNIQUE(username),
    UNIQUE(email)
);

DROP TABLE IF EXISTS appointment;
CREATE TABLE appointment(
    appointment_id INTEGER,
    day INTEGER not null,
    month INTEGER not null,
    year INTEGER not null,
    first_name text not null,
    last_name text not null,
    phone text not null,
    start_time smalldatetime not null,
    end_time smalldatetime not null,
    business_id int references service(business_id)
    on update cascade,
    CONSTRAINT appt_id_pk PRIMARY KEY(appointment_id),
    UNIQUE(day, month, year, first_name, last_name, phone, start_time, end_time)
);