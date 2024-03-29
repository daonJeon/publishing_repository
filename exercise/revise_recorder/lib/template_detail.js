

module.exports = {
    structure: function (title, body , control){
      var data = JSON.parse(body)// 데이터 받아오기
      
      var styleIsTrue = function () {//외부 스타일 시트 추가
        var projectStyleSheet = data.stylesheetSrc,
        txt = '';

        for (var style_index = 0; style_index < projectStyleSheet.length; style_index++) {
          txt += `<link type="text/css" rel="stylesheet" href="${projectStyleSheet[style_index]}.css"/>`
        }
        return txt;
      }

      return `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          <link type="text/css" rel="stylesheet" href="style.css"/>
          <!-- 외부 스타일 시트 추가 -->
          ${styleIsTrue()}
      </head>
      <body>
          <div class="task-list-wrap">
            <h1 class="main-title">${title}</h1>
            <section class="task-item">
              <h3 class="task-title">안내사항</h3>
              ${data.imgSrc == ''|| data.imgSrc == 'undefined'?' ':`<img src="../images/${title}.jpg"/>`}
              <div class="task">
                <p>${data.description}</p> 
              </div>
              ${this.taskCount(body)}
              
          </section>
                
          ${control}
              
          </div>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/themes/prism.min.css">
          <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/components/prism-core.min.js"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/plugins/autoloader/prism-autoloader.min.js"></script>
        
      </body>
      </html>
        `
    },
    taskCount : function (body) {
      var data = JSON.parse(body)
      var html = '';
      var count = 0;

      for (var page_i = 0; page_i < data.pageTask.length; page_i++) { //pageTask는 기본 3으로 고정되어 있음 `-54
        var taskNumb = Number(data.taskNum[page_i])//* 입력한 요청 갯수 값
        taskNumb== 0? html += '' : html += `<h2>${data.pageTask[page_i]}</h2>`
        
        for (var task_i = 0; task_i < taskNumb ; task_i++) {
          if(taskNumb == 0) {
            html += '' 
          } else {
            var index = count;
            
            html += `
            <div class="code-box">
              <div class="task before">
                <h3 class="task-title">변경 전 화면</h3>`
                if(data.codeType[index]=='html'){// ** 코드 타입이 html 이라면 화면을 보여줌
                  html+=data.codeBefore[index]
                } 
                html += `<h3 class="task-title">코드</h3>
                <pre class="language-${data.codeType[index]}" tabindex="0"><code class="language-${data.codeType[index]}">${this.ConvertSystemSourcetoHtml(data.codeBefore[index])}</code></pre>
              </div>
              <div class="task after">
                <h3 class="task-title">변경 후 화면</h3>`
                if(data.codeType[index]=='html'){// ** 코드 타입이 html 이라면 화면을 보여줌
                  html+=data.codeAfter[index]
                } 
                html += `<h3 class="task-title">코드</h3>
                <pre class="language-${data.codeType[index]}" tabindex="0"><code class="language-${data.codeType[index]}">${this.ConvertSystemSourcetoHtml(data.codeAfter[index])}</code></pre>
              </div>
            </div>`
            count ++;
          }
        }
      }
      return html;
    },
    ConvertSystemSourcetoHtml :function (str){  
      if(str == undefined)  return
      var str = str.toString() //JSON.stringfy가 아니라 toString으로 변경
      str = str.replace(/</gi,"&lt;"); 
      str = str.replace(/>/gi,"&gt;");
      str = str.replace(/\"/gi,"&quot;");
      str = str.replace(/\'/gi,"&#39;");
      str = str.replace(/\n/gi,"<br />");
      str = str.replace(/\$/gi,"&#36;");
      str = str.replace(/{/gi,"&#123;");
      str = str.replace(/}/gi,"&#125;");
      str = str.replace(/\[/gi,"&#91;");
      str = str.replace(/]/gi,"&#93;");
      return str;
    }
  
  }
  