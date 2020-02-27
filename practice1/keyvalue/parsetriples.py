import re

class ParseTriples():
    
    def __init__(self,filename):
        super().__init__()
        self._filename = filename
        self._file = open(self._filename,"r",errors='ignore')

    def getNextLabel(self):
        #print('Current file: {}.'.format(self._filename))
        if(self._file.closed):
            print('File: {}. is closed'.format(self._filename))
            return None

        line = self._file.readline()
        while((isinstance(line,str)) and line.startswith("#")):
            line = self._file.readline()
        
        if(not line):
            print("Line was not found.")
            return None
        
        m = re.match('<(.+)>\s*<(.+)>\s*[<"](.+)[<"]',line.strip())

        if(m):
            return m.group(1),m.group(2),m.group(3)
        else:
            print("No matches.")
            return None

    def getNextImage(self):
        #print('Current file: {}.'.format(self._filename))
        
        if(self._file.closed):
            print('File: {}. is closed'.format(self._filename))
            return None

        line = self._file.readline()
        # print("line: ", line)
        while((isinstance(line,str)) and line.startswith("#")):
            line = self._file.readline()
        
        if(not line):
            print("Line was not found.")
            return None
        
        m = re.match('<(.+)>\s*<(.+)>\s*<(.+)>\s', line.strip())
        if(m):
            return m.group(1),m.group(2),m.group(3)
        else:
            print("No matches.")
            return 
    