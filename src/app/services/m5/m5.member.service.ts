import {HttpClient, HttpEvent, HttpHeaders, HttpResponse} from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';
import {Observable, of, throwError} from 'rxjs';
import {M5Service} from './m5.service';

import {Member, M5Result, M5ResultMember} from '../../models';
import {catchError, map, tap} from 'rxjs/operators';
import {LOCAL_STORAGE, StorageService} from 'ngx-webstorage-service';
import {ObjectUtils} from '../../utils/ObjectUtils';
import * as moment from 'moment';
import {environment} from '../../../environments/environment';
const request = require('request');

@Injectable({
  providedIn: 'root'
})

export class M5MemberService extends M5Service {

  private chainUpdate =  false;

  constructor(
    protected http: HttpClient,
    @Inject(LOCAL_STORAGE) private storage: StorageService) {
    super();
  }

 

  public isLoggedin() {
    return this.storage.get('member');
  }

  public isChainUpdate(){
    return this.chainUpdate;
  }

  private setChianUpdate(set){
    this.chainUpdate =  set;
  }
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   *  로그아웃
   -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public logout() {
    console.log('logout');
    this.storage.remove('member');
    this.storage.remove('board');
    this.storage.remove('accessToken');
    //kimcy add
    this.storage.remove('username');
    this.storage.remove('userToken');  //추후 삭제 안할수도..
    //this.storage.remove('password'); 패스워드 없애면 죽음 왜 안지울까?

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   *  로그인
   *
   *  username
   *  password
   -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
   initialize(username, password) {
    // Setting URL and headers for request
    var options = {
        uri: M5MemberService.login,
        method: 'POST',
         headers: {
          'Content-Type': 'application/json'
        },
        body:{
          id:username,
          pwd:password
        },
        json : true
    };
    // Return new promise 
    return new Promise(function(resolve, reject) {
        request.post(options, function(err, resp, body) {
            if (err) {
              console.log('m5.member.11..로그인실패');
                reject(err);
            } else {
                if(resp.statusCode == 200){
                 resolve(body.token);
                }else{
                  console.log('m5.member..22..로그인실패');
                  reject(resp.headers);
                }
            }
        });
    });

}

   public getLoginToken(member,storage) {
    var initializePromise = this.initialize(member.username, member.password);

      initializePromise.then(function(result) {
          var userToken = result;
          console.log("userToken :",userToken);
          member.token = userToken;
          storage.set('member',member);
      }, function(err) {
          console.log(err);
          //kimcy: 다 지우는게 맞나?
          storage.remove(member);
      })
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   *  proof-create
   *
   *  username
   *  password
   -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//    initProof(username, token, path) {
//     // Setting URL and headers for request
//     var options = {
//         uri: M5MemberService.create,
//         method: 'POST',
//          headers: {
//           'Content-Type': 'application/json',
//           'X-Auth-Token': token
//         },
//         body:{
//           id:username,
//           file:decodeURI(path)
//         },
//         json : true
//     };
//     // Return new promise 
//     return new Promise(function(resolve, reject) {
//         request.post(options, function(err, resp, body) {
//             if (err) {
//               console.log('11. proof create. 실패');
//                 reject(err);
//             } else {
//                 console.log(resp);
//                 //if(resp.statusCode == 200){
//                   if(body.key.code == 10000){
//                   console.log('proof create.성공');
//                  resolve(body.key.code);
//                 }else{
//                   console.log('22.. proof create.실패');
//                   reject(body);
//                 }
//             }
//         });
//     });

// }

//    public createProof(member,filepath,storage) {
//     //var path = decodeURI(response.uploadPath);
//     //console.log('filepath = ',decodeURI(filepath));
//     var initializePromise = this.initProof(member.username, member.token, filepath);

//       initializePromise.then(function(result) {
//           //var userToken = result;
//           console.log("createProof => result :",result);
//           var chainArray=[];
//           var str = {'name' : filepath, 'status': true};
//           var jsonStr = JSON.stringify(str);
//           chainArray = storage.get('chain');
//           console.log('chainArray = ',chainArray);
//           if(chainArray == undefined){
//             storage.set('chain', jsonStr); 
//           }else{
//             chainArray.push(jsonStr); 
//             storage.set('chain', chainArray); 
//           }



//       }, function(err) {
//           console.log(err);
//         //  storage.set(filepath,false);
//       })
//   }

  // private handleLoginResponse(response: any) {
  //   console.log('로그인 : ',response);
  //   this.handleData(response);
  //   this.storage.set('member', response.member);
  //   this.storage.set('accessToken', decodeURIComponent(response.accessToken));
  //   if (response.orgBoards != null) {
  //     response.orgBoards.forEach(board => {
  //       console.log(board);
  //       if (board.type === 'board') {
  //         this.storage.set('board', board);
  //       }
  //     });
  //   } else {
  //     this.storage.set('board', {
  //       id: 'SVCBoard_481477478793500'
  //     });
  //   }

  //   return response || {};

  // }

  
  //자체 서버가 필요없음으로 삭제해야 될 부분
  // public login(member: Member): Observable<M5ResultMember> {

  //   console.log('LOGIN : ', member);
  //   const body = ObjectUtils.copy(member);
  //   body.fetchOrgBoards = true;
  //   return this.http.post(this.url.login(), body)
  //     .pipe(
  //       map(res => this.handleLoginResponse(res)),
  //       catchError(this.handleError)
  //     );
  // }



  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   *  사용자 등록
   *
   *  username
   *  password
   -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  private handleSignupResponse(response: any) {
    console.log('사용자등록');
    this.handleData(response);
    this.storage.set('member', response.member);
    this.storage.set('accessToken', decodeURIComponent(response.accessToken));
    this.storage.set('board', {
      id: 'SVCBoard_481477478793500'
    });
    return response.member || {};
  }


  public signup(member: Member): Observable<M5Result> {

    console.log('m5.member.service-> signup');
    const formData = new FormData();
    formData.append('username', member.username);
    formData.append('password', member.password);
    formData.append('fullname', member.fullname);
    formData.append('fetchOrgBoards', 'true');


    const params = this.getFormUrlEncoded({
      username: member.username,
      password: member.password,
      fullname: member.fullname,
      level: 'USER',
      fetchOrgBoards: true
    });

    return this.http.post(this.url.signup() + '?' + params,
      {})
      .pipe(
        map(res => this.handleSignupResponse(res)),
        catchError(this.handleError)
      );
  }


  private handleMemberDetailResponse(response: any) {
    console.log('>>> handleMemberDetailResponse', response);
    return response;
  }

  private handleUserDataResponse(response: any) {
    console.log('>>> handleUserDataResponse', response);
    return response;
  }

  public detail(member): Observable<M5ResultMember> {

    const params = this.getFormUrlEncoded({
      accessToken: this.storage.get('accessToken')
    });

    return this.http.get(this.url.members(member.username) + '?' + params)
      .pipe(
        map(res => this.handleMemberDetailResponse(res)),
        catchError(this.handleError)
      );
  }

  public updateFolderData(folderItem, member): Observable<M5Result> {
    if (member === undefined) {
      return;
    }
    const formData = new FormData();
    let userData = member.userData;
    if (userData === undefined) {
      userData = {};
    }

    userData.lastZip = folderItem.lastZip;
    userData.lastUploaded = folderItem.lastUploaded;
    userData.version = environment.VERSION;
    if (userData.pcs === undefined) {
      userData.pcs = {};
    }
    if (folderItem.deviceResource == null) {
      folderItem.deviceResource = {
        macaddress: 'MAC'
      };
    }
    if (userData.pcs[folderItem.deviceResource.macaddress] === undefined) {
      userData.pcs[folderItem.deviceResource.macaddress] = {};
    }
    userData.pcs[folderItem.deviceResource.macaddress].resource = folderItem.deviceResource;
    if (userData.pcs[folderItem.deviceResource.macaddress].folders === undefined) {
      userData.pcs[folderItem.deviceResource.macaddress].folders = {};
    }
    userData.pcs[folderItem.deviceResource.macaddress].folders[folderItem.path] = {
      size: folderItem.count,
      folderName: folderItem.path.replace(/\\/g, '/'),
      error: folderItem.error,
      updated: moment().unix()
    };


    console.log('***UPDATEFOLDERDATA.MEMBER', folderItem);


    const params = this.getFormUrlEncoded({
      userData: JSON.stringify(userData),
      accessToken: this.storage.get('accessToken')
    });

    const url = this.url.members(member.id) + '/userData?' + params;
    console.log('UPDATEFOLDERDATA.URL', url);
    return this.http.post(url,
      {})
      .pipe(
        map(res => this.handleUserDataResponse(res)),
        catchError(this.handleError)
      );

  }
}
