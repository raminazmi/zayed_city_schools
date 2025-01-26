### Laravel Setup
1. **Install Composer**: Laravel uses Composer to manage its dependencies. You can install Composer by following the instructions [here](https://getcomposer.org/download/).
2. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/studentattendancesystem.git
   cd studentattendancesystem/backend
   ```

3. **Install dependencies**:
   ```bash
   composer install
   ```

4. **Set up the environment**:
   Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

5. **Generate an application key**:
   ```bash
   php artisan key:generate
   ```

6. **Run database migrations**:
   ```bash
   php artisan migrate
   ```

7. **Start the Laravel development server**:
   ```bash
   php artisan serve
   ```

### React Setup

1. **Install Node.js**: React requires Node.js to run. You can download and install Node.js from [here](https://nodejs.org/).

2. **Navigate to the frontend directory**:
   ```bash
   cd ../frontend
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the React development server**:
   ```bash
   npm run dev
   ```

Now, the Laravel backend will be running on `http://localhost:8000`, and the React frontend on `http://localhost:3000`.
