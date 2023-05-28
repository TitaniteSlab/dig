require 'rubygems'
require 'zip'

inDirPath = './'
outFilePath = './dig.nw'

# delete old output
File.delete(outFilePath) if File.exists?(outFilePath)

# overwrite
Zip.continue_on_exists_proc = true

# zip files; skip build/git files
Zip::File.open(outFilePath, Zip::File::CREATE) do |zipfile|
    Dir[File.join(inDirPath, '**', '**')].each do |file|
	  next if file == '.git' || file == 'build.rb'
      zipfile.add(file.sub(inDirPath, ''), file)
    end
end