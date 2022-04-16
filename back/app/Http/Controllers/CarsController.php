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
        $query = Car::whereNotNull('title');
        if ($request->has('search') && $request->input('search') !== 0) {
            $query = Car::where('title', 'like', "%{$request->input('search')}%")
                ->orWhere('description', 'like', "%{$request->input('search')}%");
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
        try {
            $car->delete();
            return 'success';
        } catch (\Exception $e) {
            return 'exception: '.$e->getMessage();
        }
    }

    protected function validateRequest(Request $request)
    {
        return $request->validate([
            'title' => 'required',
            'description' => 'required',
        ]);
    }
}
