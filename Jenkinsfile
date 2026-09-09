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

        EC2_HOST = "54.205.49.229"
        EC2_APP_PORT = "80"
        EC2_SSH_CREDENTIALS_ID = "ec2-ssh"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            when {
                anyOf {
                    branch 'dev'
                    branch 'stage'
                }
            }
            steps {
                // The express does not support builds and runs as a nodejs process
                echo "Building"
                sh 'npm install'
                echo "Build Complete"
            }
        }

        stage('Test & Lint') {
            when {
                anyOf {
                    branch 'dev'
                    branch 'stage'
                }
            }
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
            agent { label 'local-node-1' }
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
            when {
                branch 'production'
            }
            agent { label 'local-node-1' }
            steps {
                withCredentials([sshUserPrivateKey(
                    credentialsId: "${EC2_SSH_CREDENTIALS_ID}",
                    keyFileVariable: 'SSH_KEY',
                    usernameVariable: 'SSH_USER'
                )]) {
                    sh """
                        ssh -i \$SSH_KEY -o StrictHostKeyChecking=no \$SSH_USER@${EC2_HOST} 'mkdir -p ~/node-js-sample'
                        scp -i \$SSH_KEY -o StrictHostKeyChecking=no ${ARCHIVE_NAME} scripts/deploy-ec2.sh \$SSH_USER@${EC2_HOST}:~/node-js-sample/
                        ssh -i \$SSH_KEY -o StrictHostKeyChecking=no \$SSH_USER@${EC2_HOST} 'chmod +x ~/node-js-sample/deploy-ec2.sh && ~/node-js-sample/deploy-ec2.sh ${ARCHIVE_NAME} ${EC2_APP_PORT}'
                    """
                }
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
