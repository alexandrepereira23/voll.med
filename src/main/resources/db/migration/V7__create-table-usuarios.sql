create table if not exists usuarios(

                        id bigint not null auto_increment,
                        login varchar(100) not null,
                        senha varchar(255) not null,
                        role varchar(20) not null default 'ROLE_FUNCIONARIO',

                        primary key(id)

);