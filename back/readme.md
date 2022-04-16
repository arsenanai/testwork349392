# CRUD APP using Laravel + Vue with TDD - Backend

## Steps to install

set environment variables for database setup like in .env.example. Then run these commands:
```sh
cd back
composer install
php artisan migrate
php artisan db:seed
```
To run tests...
```sh
./vendor/bin/phpunit
```
To start local server
```sh
php artisan serve
```