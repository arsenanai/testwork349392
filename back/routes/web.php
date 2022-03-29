<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

Route::get('/cars', 'CarsController@index');

Route::post('/cars', 'CarsController@store');

Route::patch('/cars/{car}', 'CarsController@update');

Route::delete('/cars/{car}', 'CarsController@delete');