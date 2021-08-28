var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js')
var templateContent = require('./lib/template_detail.js')
var path = require('path')

var mimeType = {//확장자에 따라서 content-type header 값을 동적으로 생성
  //html  단일 페이지 뿐만 아니라 모든 정적요소 불러오기 위함
  ".ico": "image/x-icon",
  ".html": "text/html",
  ".txt ": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg"
}

var app = http.createServer(function(request,response){
  var _url = request.url;
  var ext = path.parse(_url).ext
  var publicPath = path.join(__dirname, "./public")
  
  if(Object.keys(mimeType).includes(ext)) {//mine Type 딕셔너리로 있을 경우
    fs.readFile(`${publicPath}${_url}`,(err,data)=> {
      if(err) {
        response.statusCode = 404;
        response.end('Not found')
      } else {
        response.statusCode = 200
        response.setHeader("Content-Type", mimeType[ext])//응답을 화면으로 보여줌
        response.end(data)
      }
    })
    
  } else {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    //url 주소뒤에 입력한 값을 객체 형태로 반환
    var pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){//목록
      var pageTitle = "Main"//페이지 타이틀
      if(queryData.id == undefined) {
        fs.readdir('./data', function(error, filelist){
          var list = template.list(filelist, queryData.id);
          var html = template.structure(pageTitle, list, ``,`
            <div class="btn-group">
              <a href="/create" class="btn blue"><span class="txt">새 공지사항</span></a>
            </div>
            `);
            response.writeHead(200);
            response.end(html);
        })          
      } else {
        fs.readFile(`data/${queryData.id}`,'utf8',function(err,fileContent){
          var data = JSON.parse(fileContent)
          var html = templateContent.structure(queryData.id, data,`
          <div class="btn-group">
            <a href="/" class="btn blue"><span class="txt">목록으로 돌아가기</span></a>
            <form action="delete_process" method="post" style="display:inline-block">
              <input type="hidden" name="id" value="${queryData.id}">
              <input type="submit" class="btn blue" value="삭제">
            </form>
              <a href="/create" class="btn blue"><span class="txt">새 공지사항</span></a>
          </div>
          `);
          response.writeHead(200);
          response.end(html);
        })        
      }
      

    } else if(pathname === '/create'){
      fs.readdir('./data', function(error, filelist){
        var title = '공지사항 등록';
        var html = template.structure(title, '', `
            <form action="/create_process" method="post">
            <div id="wrap">
              <div class="input-area">
                <div class="inp-txt">
                  <input type="text" name="fileName" placeholder="fileName : 예) 20210822">
                </div>
                <textarea name="description" placeholder="description" class="textarea" title="글 내용"></textarea>        
                <div class="code-box">
                  <div class="before">
                    <textarea name="codeBefore" placeholder="변경 전 code here" class="textarea" title="글 내용"></textarea>                  
                  </div>
                  <div class="after">
                    <textarea name="codeAfter" placeholder="변경 후 code here" class="textarea" title="글 내용"></textarea>   
                  </div>
                </div>
        
              </div>
              <div class="btn-group">
                <a href="/" class="btn blue"><span class="txt">목록으로 돌아가기</span></a>
                <input type="submit" class="btn blue">
              </div>
              
            </div>           
            </form>
          `,``);
        response.writeHead(200);//성공
        response.end(html);
      });
    } else if(pathname === '/create_process'){//Post 방식으로 보낸 데이터를 Node js에서 불러오기!!
      var body = '';
      request.on('data',function(data){//
          body += data;
      })//node js로 접속 들어올때마다 콜백 함수로 node 호출

      request.on('end',function(){
          var post = qs.parse(body);
          var fileName = post.fileName;
          var collection = {
            fileName : post.fileName,
            description : post.description,
            codeBefore : post.codeBefore,
            codeAfter : post.codeAfter
          }
          
          fs.writeFile(`data/${fileName}`, `${JSON.stringify(collection)}`,'utf8',
          function(err){
            var data = JSON.parse(collection)
            var html = templateContent.structure(queryData.id,`${data}`,`
            <div class="btn-group">
              <a href="/" class="btn blue"><span class="txt">목록으로 돌아가기</span></a>
              <form action="delete_process" method="post" style="display:inline-block">
                <input type="hidden" name="id" value="${queryData.id}">
                <input type="submit" class="btn blue" value="삭제">
              </form>
                <a href="/create" class="btn blue"><span class="txt">새 공지사항</span></a>
            </div>
            `);
            response.writeHead(302, {Location:`/?id=${fileName}`});
            response.end(html);
          })      
      })
  
    } else if(pathname === '/update'){//업데이트 했을 때 보여지는 화면
      fs.readdir('./data', function(error, filelist) {
        var filteredId = path.parse(queryData.id).base
        fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
            var title = queryData.id;
            var sanitizedTitle = title;
            var sanitizedDescription = description;
            var list = template.list(filelist);
            //form 입력 후 데이터를 어디로 보낼 것인가
            var html = template.structure(title, list,          
            `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${title}"><!--업데이트 될 데이터가 쉉될수 있으므로 hidden 에 저장-->
              <p><input type="text" name="title" placeholder="title" value="${title}"></p>
              <p>
                <textarea name="description" placeholder="description">${description}</textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
          `,`<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
          );
            response.writeHead(200);
            response.end(html);
        });
      });   
    } else if(pathname === '/update_process'){
      var body = '';
      //request 객체에 이벤트 리스너를 등록해서 다른 스트림에 파이프로 연결 
      //스트림의 data와 end 이벤트에 이벤트 리스너 등록
      //스트림 : 스트리밍 데이터로 작업하기 위한 추상적인 인터페이스 
      //입 출력 기기나 프로세스, 파일 등 어디로 가는지, 어디에서 왔는지 상관없이 통일된 방식으로 데이터를 다루기 위한 가상의 개념 
      //노드에서 사용하는 많은 오브젝트들이 stream object 임. 
      //http 서버의 request나 process.stdout 도 스트림 인스턴스
      // 스트림들은 읽을 수 있거나 쓸 수 있거나, 혹은 둘다 가능 
      request.on('data',function(data){
        body += data;
      })
      request.on("end",function(){
        var post = qs.parse(body)      
        var id = post.id;
        var title = post.title;
        var description = post.description;
  
        fs.rename(`data/${id}`,`data/${title}`,function(error){
          fs.writeFile(`data/${title}`, description,'utf8',
          function(err){
            response.writeHead(302, {Location:`/?id=${title}`});
            response.end();
          })     
        })
      })
    } else if(pathname === '/delete_process'){
      var body = '';
      request.on('data',function(data){
        body += data;
      })
      request.on("end",function(){
        var post = qs.parse(body)      
        var id = post.id;
        fs.unlink(`data/${id}`,function(err){
          response.writeHead(302, {Location : `/`});
          response.end();
        })
      })
    } else {
      response.writeHead(404);
      response.end('Not found');
    }

  }




});
app.listen(3000);