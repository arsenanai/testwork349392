<?php

namespace App\Http\Controllers;

use App\Car;
use Illuminate\Http\Request;

class CarsController extends Controller
{
    public function index() {
        return Car::all();
    }

    protected function validateRequest(Request $request)
    {
        return $request->validate([
            'title' => 'required',
            'description' => 'required',
        ]);
    }

    public function store(Request $request)
    {
        return Car::create($this->validateRequest($request));
    }

    public function update(Request $request, Car $car)
    {
        $car->update($this->validateRequest($request));
        return $car;
    }

    // public function delete()
    // {

    // }
}
