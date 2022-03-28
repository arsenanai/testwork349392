<?php

namespace Tests\Feature;

use App\Car;
use Tests\TestCase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CarsTest extends TestCase
{
    use WithFaker, RefreshDatabase;
        
    private $carNames, $attributes;

    protected function setUp()
    {
        parent::setUp();
        $this->carNames = ['Mercedes', 'Lexus', 'Subaru', 'Toyota', 'Audi', 'Ford', 'Infinity', 'Bentley'];
        $this->attributes = [
            'title' => $this->faker->randomElement($this->carNames),
            'description' => $this->faker->sentence()
        ];
    }

    /** @test */
    public function a_user_can_create_a_car()
    {
        $this->post('/cars', $this->attributes)->assertSee($this->attributes['description']);

        $this->assertDatabaseHas('cars', $this->attributes);

        $this->get('/cars')->assertSee($this->attributes['title']);
    }

    /** @test */
    public function a_title_is_required_for_a_car()
    {
        $response = $this->post('/cars', [
            'title' => '',
            'description' => $this->faker->sentence()
        ]);

        $response->assertSessionHasErrors('title');
    }

    /** @test */
    public function a_description_is_required_for_a_car()
    {
        $response = $this->post('/cars', [
            'title' => $this->faker->randomElement($this->carNames),
            'description' => ''
        ]);

        $response->assertSessionHasErrors('description');
    }

    /** @test */
    public function a_car_can_be_updated()
    {
        $this->withoutExceptionHandling();

        $this->post('/cars', $this->attributes)->assertSee($this->attributes['description']);

        $car = Car::first();

        $response = $this->patch('/cars/'.$car->id, [
            'title' => 'Kia',
            'description' => 'Some updated description'
        ]);

        $this->assertEquals('Kia', Car::first()->title);
        $this->assertEquals('Some updated description', Car::first()->description);
    }
}
