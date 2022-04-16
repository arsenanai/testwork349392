<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware(['cors'])->group(function () {
    Route::get('/cars', 'CarsController@index');

    Route::post('/cars', 'CarsController@store');

    Route::patch('/cars/{car}', 'CarsController@update');

    Route::delete('/cars/{car}', 'CarsController@delete');
});
