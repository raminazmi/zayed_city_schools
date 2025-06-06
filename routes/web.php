<?php

use App\Http\Controllers\Admin\AttendanceController;
use App\Http\Controllers\Admin\ClassRoomController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ProfileController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\TeacherController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Teacher\TeacherDashboardController;
use App\Http\Controllers\Teacher\TeacherProfileController;
use App\Http\Controllers\Teacher\TeacherAttendanceController;
use App\Http\Controllers\Teacher\TeacherStudentController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ErrorController;
use App\Http\Controllers\Teacher\TeacherReportController;
use App\Http\Controllers\Admin\MessageController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/unauthorized', [ErrorController::class, 'unauthorized'])->name('unauthorized');

// Route::middleware('auth')->group(function () {
//     Route::get('/api/reports/{id}', [ReportController::class, 'apiShow']);
//     Route::post('/api/reports/generate', [ReportController::class, 'apiGenerateReport']);
//     Route::post('/api/reports/send', [ReportController::class, 'apiSendReport']);
// });
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard/home', [DashboardController::class, 'index'])->name('dashboard');

    Route::post('/send-whatsapp', [MessageController::class, 'sendWhatsAppMessage']);

    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/edit', [ProfileController::class, 'edit'])->name('edit');
        Route::patch('/', [ProfileController::class, 'update'])->name('update');
        Route::put('password', [ProfileController::class, 'updatePassword'])->name('password.update');
        Route::delete('/', [ProfileController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('dashboard/attendance')->name('attendance.')->group(function () {
        Route::get('/', [AttendanceController::class, 'index'])->name('index');
        Route::get('/add-new-attendance', [AttendanceController::class, 'create'])->name('create');
        Route::post('/', [AttendanceController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [AttendanceController::class, 'edit'])->name('edit');
        Route::put('/{id}', [AttendanceController::class, 'update'])->name('update');
        Route::get('/report', [AttendanceController::class, 'report'])->name('report');
        Route::get('/{id}/export', [AttendanceController::class, 'export'])->name('export');
        Route::get('/export-all', [AttendanceController::class, 'exportALL'])->name('exportALL');
        Route::get('/attendance-stats', [AttendanceController::class, 'getAttendanceStats']);
        Route::get('/attendance-statistics', [AttendanceController::class, 'getAttendanceStatistics']);
        Route::delete('/{id}', [AttendanceController::class, 'destroy'])->name('destroy');
        Route::get('/{id}/attendance', [AttendanceController::class, 'attendance'])->name('attendance');
        Route::post('/{id}/attendance', [AttendanceController::class, 'saveAttendance'])->name('saveAttendance');
        Route::post('/{id}/save-attendance', [AttendanceController::class, 'saveAttendance']);
        Route::get('/{id}/view', [AttendanceController::class, 'viewAttendance'])->name('view');
        Route::post('/send-whatsapp-notification', [AttendanceController::class, 'sendNotification']);
        Route::post('/send-whatsapp-document', [AttendanceController::class, 'sendDocument']);
        Route::get('/generate-behavioral-report/{id}', [AttendanceController::class, 'generateBehavioralReport'])->name('generateBehavioralReport');
        Route::get('/generate-and-send-behavioral-report/{id}', [AttendanceController::class, 'generateAndSendBehavioralReport'])->name('generateAndSendBehavioralReport');
    });

    Route::prefix('dashboard/classes')->name('classes.')->group(function () {
        Route::get('/', [ClassRoomController::class, 'index'])->name('index');
        Route::get('/add-new-class', [ClassRoomController::class, 'create'])->name('create');
        Route::post('/', [ClassRoomController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [ClassRoomController::class, 'edit'])->name('edit');
        Route::put('/{id}', [ClassRoomController::class, 'update'])->name('update');
        Route::delete('/{id}', [ClassRoomController::class, 'destroy'])->name('destroy');
        Route::get('/{id}/attendance', [ClassRoomController::class, 'attendance'])->name('attendance');
        Route::post('/{id}/attendance', [ClassRoomController::class, 'saveAttendance'])->name('saveAttendance');
        Route::post('/{id}/save-attendance', [ClassRoomController::class, 'saveAttendance']);
        Route::get('/getClasses', [ClassRoomController::class, 'getClasses'])->name('getClasses');
        Route::post('/import', [ClassRoomController::class, 'import'])->name('import');
        Route::post('/reassign-teachers', [ClassRoomController::class, 'reassignTeachers'])->name('admin.classes.reassign-teachers');
    });

    Route::prefix('dashboard/teachers')->name('teachers.')->group(function () {
        Route::get('/', [TeacherController::class, 'index'])->name('index');
        Route::get('/add-new-teacher', [TeacherController::class, 'create'])->name('create');
        Route::post('/', [TeacherController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [TeacherController::class, 'edit'])->name('edit');
        Route::put('/{id}', [TeacherController::class, 'update'])->name('update');
        Route::delete('/{id}', [TeacherController::class, 'destroy'])->name('destroy');
        Route::post('/import', [TeacherController::class, 'import'])->name('import');
    });

    Route::prefix('dashboard/students')->name('students.')->group(function () {
        Route::get('/', [StudentController::class, 'index'])->name('index');
        Route::get('/add-new-student', [StudentController::class, 'create'])->name('create');
        Route::post('/', [StudentController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [StudentController::class, 'edit'])->name('edit');
        Route::put('/{id}', [StudentController::class, 'update'])->name('update');
        Route::delete('/{id}', [StudentController::class, 'destroy'])->name('destroy');
        Route::get('/{id}/view', [StudentController::class, 'view'])->name('view');
        Route::post('/import', [StudentController::class, 'import'])->name('import');
        Route::get('/search', [StudentController::class, 'search'])->name('students.search');
        Route::get('/{id}', [StudentController::class, 'show'])->name('show');
    });

    Route::prefix('dashboard/reports')->name('reports.')->group(function () {
        Route::get('/', [ReportController::class, 'classes'])->name('index');
        Route::get('/students/{id}', [ReportController::class, 'students'])->name('students');
        Route::get('/view', [ReportController::class, 'reports'])->name('view');
        Route::get('/academic-report', [ReportController::class, 'showAcademicReport'])->name('academic_report');
        Route::post('/generate-report', [ReportController::class, 'generateReport'])->name('generateReport');
        Route::post('/send-report', [ReportController::class, 'sendReport'])->name('sendReport');
        Route::get('/{id}', [ReportController::class, 'show'])->name('show');
        Route::post('/save-draft', [ReportController::class, 'saveDraft'])->name('saveDraft');
        Route::get('/draft/{studentId}/{reportType}', [ReportController::class, 'getDraft'])->name('getDraft');
    });

    Route::prefix('dashboard/messages')->name('messages.')->group(function () {
        Route::get('/', [MessageController::class, 'index'])->name('index');
        Route::post('/send', [MessageController::class, 'sendMessage'])->name('send');
        Route::get('/get-students/{classId}', [MessageController::class, 'getStudentsByClass'])->name('getStudents');
        Route::get('/search-students', [MessageController::class, 'searchStudents'])->name('searchStudents');
    });

    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::get('/users/create', [UserController::class, 'create'])->name('users.create');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::get('/users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
});

Route::middleware(['auth', 'teacher'])->prefix('teacher')->name('teacher.')->group(function () {
    Route::get('/dashboard/home', [TeacherDashboardController::class, 'index'])->name('dashboard');
    Route::get('/change-password', [TeacherDashboardController::class, 'changePassword'])->name('change-password');
    Route::post('/update-password', [TeacherDashboardController::class, 'updatePassword'])->name('update-password');
    Route::get('/classes', [TeacherDashboardController::class, 'classes'])->name('classes');
    Route::post('/send-whatsapp', [MessageController::class, 'sendWhatsAppMessage']);

    Route::prefix('dashboard/attendance')->name('attendance.')->group(function () {
        Route::get('/', [TeacherAttendanceController::class, 'index'])->name('index');
        Route::get('/add-new-attendance', [TeacherAttendanceController::class, 'create'])->name('create');
        Route::post('/', [TeacherAttendanceController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [TeacherAttendanceController::class, 'edit'])->name('edit');
        Route::put('/{id}', [TeacherAttendanceController::class, 'update'])->name('update');
        Route::get('/report', [TeacherAttendanceController::class, 'report'])->name('report');
        Route::get('/{id}/export', [TeacherAttendanceController::class, 'export'])->name('export');
        Route::get('/export-all', [TeacherAttendanceController::class, 'exportALL'])->name('exportALL');
        Route::get('/attendance-stats', [TeacherAttendanceController::class, 'getAttendanceStats']);
        Route::get('/attendance-statistics', [TeacherAttendanceController::class, 'getAttendanceStatistics']);
        Route::delete('/{id}', [TeacherAttendanceController::class, 'destroy'])->name('destroy');
        Route::get('/{id}/attendance', [TeacherAttendanceController::class, 'attendance'])->name('attendance');
        Route::post('/{id}/attendance', [TeacherAttendanceController::class, 'saveAttendance'])->name('saveAttendance');
        Route::post('/{id}/save-attendance', [TeacherAttendanceController::class, 'saveAttendance']);
        Route::get('/{id}/view', [TeacherAttendanceController::class, 'viewAttendance'])->name('view');
        Route::post('/send-whatsapp-notification', [TeacherAttendanceController::class, 'sendNotification']);
    });

    Route::prefix('dashboard/students')->name('students.')->group(function () {
        Route::get('/', [TeacherStudentController::class, 'index'])->name('index');
        Route::get('/add-new-student', [TeacherStudentController::class, 'create'])->name('create');
        Route::post('/', [TeacherStudentController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [TeacherStudentController::class, 'edit'])->name('edit');
        Route::put('/{id}', [TeacherStudentController::class, 'update'])->name('update');
        Route::delete('/{id}', [TeacherStudentController::class, 'destroy'])->name('destroy');
        Route::get('/{id}/view', [TeacherStudentController::class, 'view'])->name('view');
        Route::get('/search', [TeacherStudentController::class, 'search'])->name('students.search');
    });

    Route::prefix('dashboard/reports')->name('reports.')->group(function () {
        Route::get('/', [TeacherReportController::class, 'classes'])->name('index');
        Route::get('/students/{id}', [TeacherReportController::class, 'students'])->name('students');
        Route::get('/view', [TeacherReportController::class, 'reports'])->name('view');
        Route::post('/send-report', [TeacherReportController::class, 'sendReport'])->name('sendReport');
        Route::get('/{id}', [TeacherReportController::class, 'show'])->name('show');
    });

    Route::prefix('dashboard/classes')->name('classes.')->group(function () {
        Route::get('/getClasses', [ClassRoomController::class, 'getClasses'])->name('getClasses');
    });

    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/edit', [TeacherProfileController::class, 'edit'])->name('edit');
        Route::patch('/', [TeacherProfileController::class, 'update'])->name('update');
        Route::put('password', [TeacherProfileController::class, 'updatePassword'])->name('password.update');
        Route::delete('/', [TeacherProfileController::class, 'destroy'])->name('destroy');
    });
});

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

require __DIR__ . '/auth.php';
