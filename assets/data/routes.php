<?

return [
    '/' => 'Controllers\Pages@Index',
    '/index' => 'Controllers\Pages@Index',

    '/admin' => 'Controllers\Pages@Admin',
    '/admin/login' => 'Controllers\Pages@Login',
    '/admin/signin' => 'Controllers\Pages@Signin',

    '/struct/:num' => [
        'GET' => 'Controllers\Struct@Select',
        'PUT' => 'Controllers\Struct@Update',
        'DELETE' => 'Controllers\Struct@Remove'
    ],
    '/struct' => [
        'GET' => 'Controllers\Struct@Select',
        'POST' => 'Controllers\Struct@Insert'
    ]


];
