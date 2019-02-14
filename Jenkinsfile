//  #!/usr/bin/env groovy
pipeline {
  agent any
  tools {nodejs "node"}
  options {
        timeout(time: 1, unit: 'HOURS')
        buildDiscarder(logRotator(numToKeepStr: '20', artifactNumToKeepStr: '100', daysToKeepStr: '60'))
        timestamps()
        ansiColor('xterm')
        disableResume()
        durabilityHint('PERFORMANCE_OPTIMIZED')
      }
  environment {
	Start="curl -X POST https://www.cotalker.com/api/messages/multi -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YzRiN2ZjYzMwMDZlMTE4Mzg4ZDE3NmIiLCJyb2xlIjoidXNlciIsImNvbXBhbnkiOiI1OGZlODNlZGE4YjcyNTk2MjViOWIxNWQiLCJkYXRlIjoxNTQ4NTMxNTc4MTUxLCJpYXQiOjE1NDg1MzE1Nzh9.OQIM7zZpoA1XExr6cRhNKdvE7to8nAdGUvJnKM-M47w' -H 'Content-Type: application/json' -d '{\"cmd\":[{\"_id\":\"5c48d940187f16bb4eeda285\",\"method\":\"POST\",\"message\":{\"content\":\" "
	End=" \",\"channel\":\"5c4b80e0e61f182037e4f346\",\"meta\":\"{\\\"kbOption\\\":null,\\\"passage\\\":null,\\\"passageField\\\":null,\\\"contentID\\\":null}\",\"isSaved\":2,\"contentType\":\"text/system\",\"sentBy\":\"5c4b7fcc3006e118388d176b\"}}]}'"
	GIT_EMAIL = sh(
               script: "git --no-pager show -s --format='%ae' $GIT_COMMIT",
               returnStdout: true
            ).trim()
	GIT_NAME = sh(
               script: "git --no-pager show -s --format='%an' $GIT_COMMIT",
               returnStdout: true
            ).trim()
    }
  stages {
    stage('preflight') {
      steps {
        sh 'node -v'
        sh 'npm --version'
      }
    }
    stage('build') {
      steps {
        sh 'npm install --v'
        sh 'npm install chai'
      }
    }
    stage('test') {
      steps {
        retry(2){
          sh 'npm test'
        }
      }
      }
    }
   post {
        failure {
              sh '''
                  Message="**❌Jenkins found a project that does not pass the test or not compile❌**  \\n  Project name: **$JOB_NAME**  \\n Jenkins link: **$BUILD_URL**  \\n GitHub link: **$GIT_URL**  \\n Branch name: **$BRANCH_NAME**  \\n Commiter: **$GIT_NAME** \\n 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"            
                  eval "$Start $Message $End"       
                  '''
             emailext (
                subject: "🔥🔥Error found in ${env.JOB_NAME}🔥🔥",
                body: """<p>One commit triggered errors! Check console output at <a href="${env.BUILD_URL}">${env.JOB_NAME}</a><br>GitHub: ${env.GIT_URL}<br>Branch name: ${env.BRANCH_NAME}<br>Hash Commit: ${env.GIT_COMMIT}</p><p>🔥Jenkins🔥</p>""",
                to: "$GIT_EMAIL"
              )
              
              
            }
        }
 }
