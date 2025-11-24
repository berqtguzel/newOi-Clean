<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * A list of exception types with their corresponding custom log levels.
     *
     * @var array<class-string<\Throwable>, \Psr\Log\LogLevel::*>
     */
    protected $levels = [
        //
    ];

    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<\Throwable>>
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     *
     * @return void
     */
    public function register()
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    public function render($request, Throwable $e)
    {
        // If it's an HTTP exception 404 and the client expects HTML, render the
        // Inertia 404 page so the React-based error UI is shown instead of
        // the plain Laravel error page.
        if ($e instanceof HttpExceptionInterface && $e->getStatusCode() === 404) {
            // For JSON/Api requests fallback to default handling
            if ($request->expectsJson()) {
                return parent::render($request, $e);
            }

            return Inertia::render('Errors/NotFound')->toResponse($request)->setStatusCode(404);
        }

        return parent::render($request, $e);
    }
}
