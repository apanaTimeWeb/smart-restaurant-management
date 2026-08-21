pipeline {
    agent any

    // Yahan hum explicitly define kar rahe hain ki kaunsi app kis port par chalegi
    environment {
        FRONTEND_PORT = '300'
        // Ye line Jenkins ko order deti hai ki PM2 ko kill mat karna!
        JENKINS_NODE_COOKIE = 'dontKillMe' 
    }

    stages {
        stage('Checkout Code') {
            steps {
                echo 'Checking out features branch from Git...'
                git branch: 'vps', url: 'https://github.com/apanaTimeWeb/smart-restaurant-management.git'
            }
        }

        // ==========================================
        // FRONTEND STAGES (Next.js)
        // ==========================================
        stage('Frontend: Install & Build') {
            steps {
                dir('frontend') {
                    echo 'Installing Next.js dependencies...'
                    sh 'npm install'
                    
                    echo 'Building Next.js for production...'
                    sh 'npm run build' 
                }
            }
        }

        stage('Deploy: Frontend (PM2)') {
            steps {
                dir('frontend') {
                    echo "Deploying Next.js Frontend to PM2 on Port ${FRONTEND_PORT}..."
                    // PORT variable force karega Next.js ko 3000 par chalne ke liye
                    sh 'PORT=$FRONTEND_PORT pm2 restart next-frontend || PORT=$FRONTEND_PORT pm2 start npm --name "next-frontend" -- run start'
                }
            }
        }


        // ==========================================
        // SAVE SERVER STATE
        // ==========================================
        stage('Save PM2 State') {
            steps {
                echo 'Saving PM2 process list so they auto-start on server reboot...'
                sh 'pm2 save'
            }
        }
    }
}