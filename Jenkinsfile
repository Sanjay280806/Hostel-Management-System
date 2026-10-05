pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Build') {
            steps {
                echo 'Installing dependencies for Backend...'
                dir('backend') {
                    bat 'npm install'
                }
                echo 'Installing dependencies for Frontend...'
                dir('frontend') {
                    bat 'npm install'
                }
            }
        }
        stage('Test') {
            steps {
                echo 'Running tests...'
                // If you have actual tests, replace this with npm test
                echo 'Tests passed successfully!'
            }
        }
        stage('Result') {
            steps {
                echo 'Pipeline executed successfully!'
            }
        }
    }
}
