pipeline {
    agent any

    tools {
        nodejs 'Node-22'
    }

    options {
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '20'))
        disableConcurrentBuilds()
    }

    environment {
        ARCHIVE_NAME = "node-js-sample-${env.BUILD_NUMBER}.tar.gz"
        NOTIFY_EMAIL = "m.qasimnauman@gmail.com"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                sh 'npm install'
            }
        }

        stage('Test & Lint') {
            parallel {
                stage('Test') {
                    steps {
                        sh 'npm test'
                    }
                }
                stage('Lint') {
                    steps {
                        sh 'npm run lint'
                    }
                }
            }
        }

        stage('Package') {
            steps {
                sh """
                    rm -f ${ARCHIVE_NAME}
                    tar --exclude='./node_modules' --exclude='./.git' -czf /tmp/${ARCHIVE_NAME} .
                    mv /tmp/${ARCHIVE_NAME} ${ARCHIVE_NAME}
                """
                archiveArtifacts artifacts: "${ARCHIVE_NAME}", fingerprint: true
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deployment Successful!'
            }
        }
    }

    post {
        success {
            mail(
                to: "${NOTIFY_EMAIL}",
                subject: "SUCCESS: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
                body: """Build succeeded.

                Job: ${env.JOB_NAME}
                Build Number: ${env.BUILD_NUMBER}
                Build URL: ${env.BUILD_URL}"""
            )
        }
        failure {
            mail(
                to: "${NOTIFY_EMAIL}",
                subject: "FAILURE: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
                body: """Build failed.
                
                Job: ${env.JOB_NAME}
                Build Number: ${env.BUILD_NUMBER}
                Build URL: ${env.BUILD_URL}
                Console Log: ${env.BUILD_URL}console"""
            )
        }
        always {
            cleanWs()
        }
    }
}
