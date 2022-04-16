<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Car extends Model
{
    //
    protected $guarded = [];

    protected $fillable = ['title', 'description'];
}
