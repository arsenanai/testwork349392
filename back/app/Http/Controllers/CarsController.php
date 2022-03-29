<?php

namespace App\Http\Controllers;

use App\Car;
use Illuminate\Http\Request;

class CarsController extends Controller
{
    public function index(Request $request)
    {
        $perPage = 2;
        if ($request->has('limit') && is_numeric($request->input('limit'))) {
            $perPage = $request->input('limit');
        }
        if ($request->has('title') && $request->input('title') !== 0) {
            $query = Car::where('title', $request->input('title'));
        } else {
            $query = Car::whereNotNull('title');
        }
        return $query->paginate($perPage);
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

    public function delete(Car $car)
    {
        $car->delete();

        return 'success';
    }

    protected function validateRequest(Request $request)
    {
        return $request->validate([
            'title' => 'required',
            'description' => 'required',
        ]);
    }
}
