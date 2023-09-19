let successfully = 0;

document.getElementById('uploadForm').addEventListener('submit', function(event) {
  event.preventDefault(); // フォームのデフォルトの送信動作を無効化

  var fileInput = document.getElementById('fileToUpload');
  var playlist_error = document.getElementById('error');

  var playlist_name = document.getElementById('Name');
  var playlist_desc = document.getElementById('Description');
  var playlist_mod  = document.getElementById('Modified');
  var playlist_size = document.getElementById('FileSize');
  var playlist_num  = document.getElementById('SongNum');

  var songs_div = document.getElementById('Songs');

  // 初期化
  playlist_name.textContent  = '';
  playlist_desc.textContent  = '';
  playlist_mod.textContent   = '';
  playlist_size.textContent  = '';
  playlist_num.textContent   = '';

  if (successfully == 1) {
    while(songs_div.lastChild){
      songs_div.removeChild(songs_div.lastChild);
    }
  }

  playlist_error.innerHTML =  ''

  if (fileInput.files.length > 0) {
    var file = fileInput.files[0];
    var fileSize = file.size;
    var reader = new FileReader();

    reader.onload = function(e) {
      try {
        // ファイルの内容をJSONとして解析
        var playlistData = JSON.parse(e.target.result);

        // 解析されたJSONデータをコンソールに表示
        console.log(playlistData);

        // データを表示するか、別の処理をここに追加
        playlist_name.textContent = `${playlistData.Info.Name}`;
        playlist_desc.textContent = `説明 : ${playlistData.Info.Description}`;
        playlist_mod.textContent  = `変更日時 : ${playlistData.Info.Modified.Y}/${playlistData.Info.Modified.M}/${playlistData.Info.Modified.D} ${playlistData.Info.Modified.h}:${playlistData.Info.Modified.m}`;
        playlist_size.textContent = `ファイルサイズ : ${formatBytes(fileSize)} (${fileSize.toLocaleString()} Bytes)`;
        playlist_num.textContent  = `楽曲数 : ${playlistData.SongData.length} 曲`;

        var song_count = 0;

        for (const songData of playlistData.SongData) {
          song_count ++;

          var song_div   = document.createElement('div');
          var song_title = document.createElement('h3');
          var song_comp  = document.createElement('p');
          var song_ext   = document.createElement('p');
          var song_mime  = document.createElement('p');
          var song_size  = document.createElement('p');
          var song_file  = document.createElement('audio');

          song_div.dataset.songId = `${song_count}`;
          songs_div.appendChild(song_div);

          song_title.textContent = `${songData.title}`;
          song_comp.textContent  = `作曲者 : ${songData.comp}`;
          song_ext.textContent   = `拡張子 : ${songData.ext}`;

          let song_mimetype = null;

          switch(songData.ext) {
            case 'aac':
              song_mimetype = 'audio/aac';
              break;

            case 'amr':
              song_mimetype = 'audio/amr';
              break;

            case 'awb':
              song_mimetype = 'audio/amr-wb';
              break;

            case '3gb':
            case '3gpp2':
            case 'm4a':
            case 'mp4':
              song_mimetype = 'audio/mp4';
              break;

            case 'mp3':
              song_mimetype = 'audio/mpeg';
              break;

            case 'mid':
            case 'midi':
            case 'xmf':
            case 'rtttl':
            case 'rtx':
            case 'ota':
              song_mimetype = 'audio/midi';
              break;

            case 'ogg':
            case 'oga':
              song_mimetype = 'application/ogg';
              break;

            case 'imy':
              song_mimetype = 'audio/imelody';
              break;

            case 'wav':
              song_mimetype = 'audio/x-wav';
              break;

            case 'smf':
              song_mimetype = 'audio/sp-midi';
              break;
          }

          song_mime.textContent = `MIMEタイプ : ${song_mimetype}`;
          song_size.textContent = `サイズ : ${formatBytes(songData.song.length)} (${songData.song.length.toLocaleString()} Bytes)`;

          song_file.src = `data:${song_mimetype};base64,${songData.song}`;
          song_file.setAttribute('controls', '');
          song_file.setAttribute('controlslist', 'nodownload')

          var song_div = document.querySelector(`[data-song-id="${song_count}"]`);

          song_div.appendChild(song_title);
          song_div.appendChild(song_comp);
          song_div.appendChild(song_ext);
          song_div.appendChild(song_mime);
          song_div.appendChild(song_size);
          song_div.appendChild(song_file);
        }

        successfully = 1;
      } catch (error) {
        // JSON解析エラーが発生した場合
        console.error(error.message);
        playlist_error.innerHTML = `<p>ファイルが読み取れませんでした。<br><span style="display: inline-block;">ファイルが破損している可能性、</span><span style="display: inline-block;">または対応していないファイルの様です。</span></p><p>エラーメッセージ : ${error.message}</p>`;

        successfully = 0;
      }
    };

    reader.readAsText(file); // テキストファイルとして読み込む
  } else {
    result.innerHTML = 'ファイルが選択されていません。';
  }
});

// バイトをキロバイト、メガバイトなどにフォーマットする関数
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB', 'RB', 'QB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}