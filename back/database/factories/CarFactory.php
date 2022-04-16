<?php

use Faker\Generator as Faker;

$factory->define(App\Car::class, function (Faker $faker) {
    $carNames = ['Mercedes', 'Lexus', 'Subaru', 'Toyota', 'Audi', 'Ford', 'Infinity', 'Bentley'];
    return [
        'title' => $faker->randomElement($carNames),
        'description' => $faker->sentence()
    ];
});
