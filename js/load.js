let successfully = 0;

// DOM要素のキャッシュ
const form = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileToUpload');
const errorElement = document.getElementById('error');
const resultElement = document.getElementById('result');
const songsDiv = document.getElementById('Songs');
const playlistElements = {
  name: document.getElementById('Name'),
  description: document.getElementById('Description'),
  modified: document.getElementById('Modified'),
  fileSize: document.getElementById('FileSize'),
  songNum: document.getElementById('SongNum'),
};

// フォームのsubmitイベントリスナー
form.onsubmit = function(event) {
  event.preventDefault(); // フォームのデフォルトの送信動作を無効化

  // 初期化
  for (const key in playlistElements) {
    playlistElements[key].textContent = '';
  }

  if (successfully === 1) {
    while (songsDiv.lastChild) {
      songsDiv.removeChild(songsDiv.lastChild);
    }
  }

  errorElement.innerHTML = '';

  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const fileSize = file.size;
    const reader = new FileReader();

    reader.onload = function(e) {
      try {
        const playlistData = JSON.parse(e.target.result);

        // データを表示
        playlistElements.name.textContent = playlistData.Info.Name;
        playlistElements.description.textContent = `説明 : ${playlistData.Info.Description}`;
        playlistElements.modified.textContent = `変更日時 : ${playlistData.Info.Modified.Y}/${playlistData.Info.Modified.M}/${playlistData.Info.Modified.D} ${playlistData.Info.Modified.h}:${playlistData.Info.Modified.m}`;
        playlistElements.fileSize.textContent = `ファイルサイズ : ${formatBytes(fileSize)} (${fileSize.toLocaleString()} Bytes)`;
        playlistElements.songNum.textContent = `楽曲数 : ${playlistData.SongData.length} 曲`;

        // 曲の表示
        let songCount = 0;

        for (const songData of playlistData.SongData) {
          songCount++;

          const songDiv = document.createElement('div');
          songDiv.dataset.songId = songCount;
          songsDiv.appendChild(songDiv);

          const songTitle = document.createElement('h3');
          songTitle.textContent = songData.title; // titleをh3で表示
          songDiv.appendChild(songTitle);

          const composerP = document.createElement('p');
          composerP.textContent = `作曲者 : ${songData.Comp}`; // Compを作曲者として表示
          songDiv.appendChild(composerP);

          const elements = ['ext'];
          elements.forEach((element) => {
            const p = document.createElement('p');
            p.textContent = element === 'ext' ? `拡張子 : ${songData[element]}` : `${element.charAt(0).toUpperCase() + element.slice(1)} : ${songData[element]}`;
            songDiv.appendChild(p);
          });

          const songMimeType = getSongMimeType(songData.ext);
          const songSize = formatBytes(songData.song.length);

          const songMimeP = document.createElement('p');
          songMimeP.textContent = `MIMEタイプ : ${songMimeType}`;
          songDiv.appendChild(songMimeP);

          const songSizeP = document.createElement('p');
          songSizeP.textContent = `サイズ : ${songSize} (${songData.song.length.toLocaleString()} Bytes)`;
          songDiv.appendChild(songSizeP);

          const audio = document.createElement('audio');
          audio.src = `data:${songMimeType};base64,${songData.song}`;
          audio.setAttribute('controls', '');
          audio.setAttribute('controlslist', 'nodownload');
          audio.dataset.songTitle = songData.title;
          songDiv.appendChild(audio);

          // ダウンロードボタンを追加
          const downloadButton = document.createElement('button');
          downloadButton.textContent = 'ダウンロード';
          downloadButton.onclick = function () {
            // ダウンロードリンクを生成してクリック
            const blob = base64ToBlob(songData.song, songMimeType);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${songData.title}.${songData.ext}`;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
          };
          songDiv.appendChild(downloadButton);
        }

        successfully = 1;
      } catch (error) {
        console.error(error.message);
        errorElement.innerHTML = 'ファイルが読み取れませんでした。';
        successfully = 0;
      }
    };

    reader.readAsText(file);
  } else {
    resultElement.innerHTML = 'ファイルが選択されていません。';
  }
};

// バイトをキロバイト、メガバイトなどにフォーマットする関数
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB', 'RB', 'QB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// 拡張子からMIMEタイプを取得する関数
function getSongMimeType(ext) {
  switch (ext) {
    case 'aac':
      return 'audio/aac';
    case 'amr':
      return 'audio/amr';
    case 'awb':
      return 'audio/amr-wb';
    case '3gb':
    case '3gpp2':
    case 'm4a':
    case 'mp4':
      return 'audio/mp4';
    case 'mp3':
      return 'audio/mpeg';
    case 'mid':
    case 'midi':
    case 'xmf':
    case 'rtttl':
    case 'rtx':
    case 'ota':
      return 'audio/midi';
    case 'ogg':
    case 'oga':
      return 'application/ogg';
    case 'imy':
      return 'audio/imelody';
    case 'wav':
      return 'audio/x-wav';
    case 'smf':
      return 'audio/sp-midi';
    default:
      return '';
  }
}

// Base64データをBlobに変換する関数
function base64ToBlob(base64Data, mimeType) {
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}
