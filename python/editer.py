import os
from tkinter import filedialog
import re
import unicodedata
import datetime
import json
import base64

def clear():
	print('\033[F\033[K', end='', flush=True)

def get_unique_filename(filename):
	base, ext = os.path.splitext(filename)
	counter = 2
	while os.path.exists(filename):
		filename = f"{base} ({counter}){ext}"
		counter += 1
	return filename

def createInfoFile():
	print('Files can be written here.\n')

	error = 0
	while True:
		playlistName = input('Playlist Name : ')
		if len(playlistName.replace(' ', '')) == 0:
			clear()
			if error >= 1:
				clear()
				print(f'\033[31mPlaylist name must be some string. * {error}\033[0m')
			else:
				print('\033[31mPlaylist name must be some string.\033[0m')
			error += 1
		else:
			if error >= 1:
				error = 0
				clear()
			break
	clear()
	print(f'\033[32mPlaylist Name : {playlistName}\033[0m')

	while True:
		playlistDesc = input('Playlist Description : ')
		if len(playlistDesc.replace(' ', '')) == 0:
			clear()
			if error >= 1:
				clear()
				print(f'\033[31mPlaylist name must be some string. * {error}\033[0m')
			else:
				print('\033[31mPlaylist name must be some string.\033[0m')
			error += 1
		else:
			if error >= 1:
				error = 0
				clear()
			break
	clear()
	print(f'\033[32mPlaylist Description : {playlistDesc}\033[0m')

	songs = []
	print()
	num = 1
	while True:
		print(f'Songs : {num}')
		while True:
			title = input('Song Title : ')
			if len(title.replace(' ', '')) == 0:
				clear()
				if error >= 1:
					clear()
					print(f'\033[31mPlaylist name must be some string. * {error}\033[0m')
				else:
					print('\033[31mPlaylist name must be some string.\033[0m')
				error += 1
			else:
				if error >= 1:
					error = 0
					clear()
				break
		while True:
			comp = input('Composer : ')
			if len(comp.replace(' ', '')) == 0:
				clear()
				if error >= 1:
					clear()
					print(f'\033[31mPlaylist name must be some string. * {error}\033[0m')
				else:
					print('\033[31mPlaylist name must be some string.\033[0m')
				error += 1
			else:
				if error >= 1:
					error = 0
					clear()
				break
		print('Song File Path : ')
		songfile = filedialog.askopenfilename(
			title = "Select Files",
			filetypes = [("Audio File", "*.aac *.amr *.awb *.3gb *.3gpp2 *.m4a *.mp4 *.mp3 *.mid *.midi *.xmf *.rtttl *.rtx *.ogg *.oga *.imy *.ota *.wav *.smf")]
		)
		clear()
		print(f'Song File Path : {songfile}')

		songs.append({'title': title, 'comp': comp, 'songfile': songfile})
		clear()
		clear()
		clear()
		clear()
		print(f'\033[32mSongs : {num}\033[0m')
		print(f'\033[32mSong Title : {title}\033[0m')
		print(f'\033[32mComposer : {comp}\033[0m')
		print(f'\033[32mSong File Path : {songfile}\033[0m')
		another_song = input('\nAdd another song? (y/n): ')
		clear()
		clear()
		clear()
		clear()
		clear()
		clear()
		num += 1
		if another_song.lower() != 'y':
			break

	print('\033[32mSongs Added:')
	for i, song in enumerate(songs, 1):
		print(f'{i}. Title : {song["title"]}, Composer : {song["comp"]}, Song File : {song["songfile"]}')
	print('\033[0m')

	def sanitize_filename(filename):
		illegal_chars = r'[\/:*?"<>|]'

		filename = re.sub(r'\s', ' ', unicodedata.normalize('NFKC', filename)).replace(' ', '_')

		sanitized_filename = re.sub(illegal_chars, '_', filename)

		return sanitized_filename

	fileName = sanitize_filename(playlistName) + '.yple'
	fileName = get_unique_filename(fileName)

	with open(fileName, 'w', encoding='utf-8') as file:
		file.write(f'[Info]\n{playlistName}\n{playlistDesc}\n\n[SongData]\n')
		for i, song in enumerate(songs, 1):
			file.write(f'{song["title"]}\n{song["comp"]}\n{song["songfile"]}\n\n')

	input('Create file.')

def createPlaylistFile():
	print('Create playlist files based on information files.')

	print('Select files : ')
	ypleFile = filedialog.askopenfilename(
		title = "Select Files",
		filetypes = [("YPLE File", "*.yple")]
	)

	clear()
	input(f'Song File Path : {ypleFile}')

	clear()
	print(f'\033[32mSong File Path : {ypleFile}\033[0m')
	input('\n')

	with open(ypleFile, 'r') as file:
		data = file.readlines()

	playlistName = data[1].strip()
	playlistDesc = data[2].strip()

	songs = []

	for i in range(5, len(data), 4):
		song_name = data[i].strip()
		song_artist = data[i + 1].strip()
		song_path = data[i + 2].strip()
		songs.append({
			'Name': song_name,
			'Artist': song_artist,
			'Path': song_path
		})

	songsData = []
	for song in songs:
		songName = song["Name"]
		songArt = song["Artist"]
		songPath = song["Path"]

		music_file_path = songPath

		try:
			with open(music_file_path, 'rb') as music_file:
				binary_data = music_file.read()
				
				base64_encoded = base64.b64encode(binary_data).decode('utf-8')
		except FileNotFoundError:
			print(f"ファイル '{music_file_path}' が見つかりませんでした。")
		except Exception as e:
			print(f"エラーが発生しました: {str(e)}")


		songExt = os.path.splitext(songPath)[1].lstrip(".")

		songData = {"title":songName,"comp":songArt,"ext":songExt,"song": base64_encoded}
		songsData.append(songData)

	dt_now = datetime.datetime.now()

	yplFile_str = {"Info":{"Name":playlistName,"Description":playlistDesc,"Modified":{"Y":dt_now.year,"M":dt_now.month,"D":dt_now.day,"h":dt_now.hour,"m":dt_now.minute}},"SongData":songsData}
	yplFile = json.dumps(yplFile_str, separators=(',', ':'), ensure_ascii=False)

	fileName = os.path.splitext(os.path.basename(ypleFile))[0] + '.ypl'
	fileName = get_unique_filename(fileName)

	with open(fileName, 'w', encoding='utf-8') as file:
		file.write(yplFile)

	input()

def main():
	print('Please select mode.\n1. Create information file.\n2. Create playlist files based on information files.\n3. Exit.')
	answer = input()

	match answer:
		case '1':
			os.system('cls')
			createInfoFile()
		case '2':
			os.system('cls')
			createPlaylistFile()
		case '3':
			exit()
		case _:
			os.system('cls')
			main()

if __name__ == "__main__":
	os.system('cls')
	main()
