pipeline {
    agent any

    tools {
        // Name must match a NodeJS installation configured under
        // Manage Jenkins > Tools > NodeJS installations (NodeJS Plugin)
        nodejs 'Node-22'
    }

    options {
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '20'))
        disableConcurrentBuilds()
    }

    environment {
        ARCHIVE_NAME = "node-js-sample-${env.BUILD_NUMBER}.tar.gz"
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
                    tar --exclude='./node_modules' --exclude='./.git' --exclude='*.tar.gz' -czf ${ARCHIVE_NAME} .
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
            emailext(
                subject: "SUCCESS: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
                body: """<p>Build succeeded.</p>
                         <p>Job: ${env.JOB_NAME}<br/>
                         Build Number: ${env.BUILD_NUMBER}<br/>
                         Build URL: <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>""",
                mimeType: 'text/html',
                to: '${DEFAULT_RECIPIENTS}'
            )
        }
        failure {
            emailext(
                subject: "FAILURE: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
                body: """<p>Build failed.</p>
                         <p>Job: ${env.JOB_NAME}<br/>
                         Build Number: ${env.BUILD_NUMBER}<br/>
                         Build URL: <a href="${env.BUILD_URL}">${env.BUILD_URL}</a><br/>
                         Console Log: <a href="${env.BUILD_URL}console">${env.BUILD_URL}console</a></p>""",
                mimeType: 'text/html',
                to: '${DEFAULT_RECIPIENTS}'
            )
        }
        always {
            cleanWs()
        }
    }
}
