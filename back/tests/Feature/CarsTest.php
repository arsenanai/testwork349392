<?php

// Car crud testing
namespace Tests\Feature;

use App\Car;
use Tests\TestCase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CarsTest extends TestCase
{
    use WithFaker;
    use RefreshDatabase;

    private $carNames;
    private $attributes;

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
    public function aUserCanCreateACar()
    {
        $this->post('/api/cars', $this->attributes)->assertSee($this->attributes['description']);

        $this->assertDatabaseHas('cars', $this->attributes);

        $this->get('/api/cars')->assertSee($this->attributes['title']);
    }

    /** @test */
    public function aTitleIsRequiredForACar()
    {
        $response = $this->post('/api/cars', [
            'title' => '',
            'description' => $this->faker->sentence()
        ]);

        $response->assertSessionHasErrors('title');
    }

    /** @test */
    public function aDescriptionIsRequiredForACar()
    {
        $response = $this->post('/api/cars', [
            'title' => $this->faker->randomElement($this->carNames),
            'description' => ''
        ]);

        $response->assertSessionHasErrors('description');
    }

    /** @test */
    public function aCarCanBeUpdated()
    {
        $this->post('/api/cars', $this->attributes)->assertSee($this->attributes['description']);

        $car = Car::first();

        $response = $this->patch('/api/cars/' . $car->id, [
            'title' => 'Kia',
            'description' => 'Some updated description'
        ]);

        $this->assertEquals('Kia', Car::first()->title);
        $this->assertEquals('Some updated description', Car::first()->description);

        $response->assertSee('Kia');
        $response->assertSee('Some updated description');
    }

    /** @test */
    public function aCarCanBeDeleted()
    {
        $this->withoutExceptionHandling();
        $this->post('/api/cars', $this->attributes);

        $car = Car::first();

        $this->assertCount(1, Car::all());

        $response = $this->delete('/api/cars/' . $car->id);

        $this->assertCount(0, Car::all());

        $response->assertSee('success');
    }

    /** @test */
    public function aCarListCanBePaginated()
    {
        $this->withoutExceptionHandling();
        $attr = null;
        for ($i = 0; $i < 100; $i++) {
            $this->attributes = [
                'title' => $this->faker->randomElement($this->carNames),
                'description' => $this->faker->sentence()
            ];
            if ($i === 0) {
                $attr = $this->attributes;
            }
            $this->withoutMiddleware()->post('/api/cars', $this->attributes);
        }

        $this->withoutMiddleware()->get('/api/cars?limit=50')
            ->assertSee('"per_page":"50')
            ->assertSee($attr['description']);
    }

    /** @test */
    public function aCarListCanBeFiltered()
    {
        $this->withoutExceptionHandling();
        $attr = null;
        for ($i = 0; $i < 100; $i++) {
            $this->attributes = [
                'title' => $this->faker->randomElement($this->carNames),
                'description' => $this->faker->sentence()
            ];
            if ($i === 99) {
                $attr = $this->attributes;
            }
            $this->withoutMiddleware()->post('/api/cars', $this->attributes);
        }

        $this->withoutMiddleware()->get('/api/cars?search=' . $attr['title'])
            ->assertSee($attr['title']);

        $this->withoutMiddleware()->get('/api/cars?search=' . $attr['description'])
            ->assertSee($attr['description']);
    }
}
