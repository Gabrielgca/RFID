import mysql.connector as mysql

print("Informe o host: ")
hst = input()
print("Informe o usuário: ")
usr = input()
print("Informe o password: ")
pwrd = input()
print("Informe o nome do banco de dados: ")
dbase = input()

conn = mysql.connect(database=dbase, user=usr, password=pwrd, host=hst)

curs = conn.cursor()

SELECT_TABLES = """SELECT TABS.TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES TABS
WHERE TABS.TABLE_SCHEMA = {} """

SELECT_TABLE_COLUMNS = """SELECT COLS.COLUMN_NAME,COLS.DATA_TYPE,
COLS.CHARACTER_MAXIMUM_LENGTH,COLS.NUMERIC_PRECISION,COLS.NUMERIC_SCALE,
COLS.IS_NULLABLE,COLS.COLUMN_DEFAULT,
COLS.COLUMN_COMMENT,COLS.COLUMN_KEY,COLS.TABLE_SCHEMA,COLS.TABLE_NAME,
COLS.EXTRA
FROM INFORMATION_SCHEMA.COLUMNS COLS
WHERE COLS.TABLE_SCHEMA = {}
AND COLS.TABLE_NAME = {}"""

SELECT_COUNT_COL_REFERENCES = """SELECT COUNT(*)
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = {}
AND TABLE_NAME = {}
AND COLUMN_NAME = {}
AND REFERENCED_TABLE_NAME IS NOT NULL"""

SELECT_COLUMN_REFERENCES = """SELECT REFERENCED_TABLE_NAME,REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = {}
AND TABLE_NAME = {}
AND COLUMN_NAME = {}"""

SELECT_CADASTROS = "SELECT * FROM tb_cadastro"

class PythonSQLAFile():
    class Import():
        def __init__(self,mainImport = None,subImports = None,alias = None):
            self.mainImport = mainImport
            if subImports is None:
                self.subImports = []
            else:
                self.subImports = []
                self.subImports.append(subImports)
            self.alias = alias

        def getAlias (self):
            return self.alias
        
        def getSubImports (self):
            return self.subImports

        def getMainImport (self):
            return self.mainImport

        def getFullImport (self):
            importStr = ''
            if len(self.subImports) == 0:
                importStr = "import "+self.getMainImport()
                if self.alias is not None:
                    importStr = importStr + " " + self.getAlias() + "\n"
                else:
                    importStr = importStr + "\n"
            else:
                i = 0
                importStr = "from " + self.getMainImport()
                for subImport in self.subImports:
                    if i == 0:
                        importStr = importStr + " import " + subImport
                    else:
                        importStr = importStr + "," + subImport
                    i += 1
                if self.alias is not None:
                    importStr = importStr + " " + self.getAlias() + "\n"
                else:
                    importStr = importStr + "\n"
            return importStr

    class MappedObject():
        class Column():
            def __init__ (self,nameTb = None, dataType = None, charMaxLength = None,
                          numericPrecision = None, numericScale = None, nullable = False,
                          default = None,comment = None,columnKey = False, tableSchema = None,
                          tableName = None,parentObj = None):
                self.nameTb = nameTb
                self.dataType = dataType
                self.charMaxLength = charMaxLength
                self.numericPrecision = numericPrecision
                self.numericScale = numericScale
                self.nullable = nullable
                self.default = default
                self.comment= comment
                self.columnKey = columnKey
                self.tableSchema = tableSchema
                self.tableName = tableName
                self.parentObj = parentObj
            
            def getTableNameObj (self):
                return self.parentObj.getName()
            
            def getColNameObj(self):
                colId = self.nameTb[0:2]
                colName = ''
                underlineList = []
                i = 1
                for char in self.nameTb:
                    if char == '_':
                        underlineList.append(i)
                    i += 1

                for i in range(0,len(underlineList)):
                    if i < len(underlineList) - 1:
                        partName = self.nameTb[underlineList[i]:underlineList[i + 1] - 1]
                        colName = colName + partName.capitalize()
                    else:
                        partName = self.nameTb[underlineList[i]:]
                        colName = colName + partName.capitalize()

                return colId+colName

            def getTypeObj(self):
                if self.dataType == 'int':
                    return 'Integer'
                elif self.dataType == 'tinyint':
                    return 'Boolean'
                elif self.dataType in ['char','varchar','nchar','nvarchar']:
                    if self.charMaxLength is not None:
                        return 'String('+str(self.charMaxLength)+')'
                    else:
                        return 'String'
                elif self.dataType == 'decimal':
                    retStr = 'Numeric('
                    if self.numericPrecision is not None:
                        retStr = retStr + str(self.numericPrecision)
                    if self.numericScale is not None:
                        retStr = retStr + ',' + str(self.numericScale)
                    retStr = retStr + ')'
                    return retStr
                elif self.dataType == 'date' or self.dataType == 'time':
                    return self.dataType.capitalize()
                elif self.dataType == 'datetime':
                    dateStr = self.dataType[0:4]
                    timeStr = self.dataType[4:]
                    return dateStr.capitalize()+timeStr.capitalize() 
                else:
                    return ''

            def getColumnKey(self):
                if self.columnKey == 'PRI':
                    return 'primary_key = True,unique = True'
                elif self.columnKey == 'UNI':
                    return 'unique = True'


            def getNullable(self):
                if self.nullable == 'NO':
                    return 'nullable = False'
                else:
                    return 'nullable = True'

            def getDefault(self):
                if self.default is not None:
                    if str(self.default) == 'NULL':
                        return 'default = None'
                    else:
                        return 'default = ' + self.default 
                else:
                    return ''
            
            def formatComment(self,comment):
                hasInitTag = True
                hasEndTag = True
                if comment[0] != "'" and comment[0] != '"':
                    hasInitTag = False
                    hasInnerSStrInit = False
                    hasInnerDStrInit = False
                    for i in range(1,len(comment) - 1):
                        if comment[i] == "'":                           
                            hasInnerSStrInit = True
                            break
                        if comment[i] == '"':
                            hasInnerDStrInit = True
                            break
                       
                if comment[len(comment) - 1] != "'" and comment[len(comment) - 1] != '"':
                    hasEndTag = False
                    hasInnerSStrEnd = False
                    hasInnerDStrEnd = False
                    for i in range(1,len(comment) - 1):
                        if comment[i] == "'":                           
                            hasInnerSStrEnd = True
                            break
                        if comment[i] == '"':
                            hasInnerDStrEnd = True
                            break
                    
                if not(hasInitTag):
                    if hasInnerSStrInit:
                        comment = '"""' + comment
                    elif hasInnerDStrInit:
                        comment = "'''" + comment
                    else:
                        comment = "'''" + comment
                        
                if not(hasEndTag):
                    if hasInnerSStrEnd:
                        comment = comment + '"""'
                    elif hasInnerDStrEnd:
                        comment = comment + "'''"
                    else:
                        comment = comment + "'''"
                        
                return comment
                        
            def getComment(self):
                if self.comment is not None:
                    if len(self.comment) > 0:
                        return 'comment = ' + self.formatComment(str(self.comment))
                    else:
                        return ''
                else:
                    return ''

            def hasReference (self):
                curs.execute(SELECT_COUNT_COL_REFERENCES.format("'"+self.tableSchema+"'",
                                                                "'"+self.tableName+"'",
                                                                "'"+self.nameTb+"'"))
                hasReference = curs.fetchall()
                if int(hasReference[0][0]) > 0:
                    return True
                else:
                    return False

            def getReferencedTable(self):
                if self.hasReference():
                    curs.execute(SELECT_COLUMN_REFERENCES.format("'"+self.tableSchema+"'",
                                                                 "'"+self.tableName+"'",
                                                                 "'"+self.nameTb+"'"))
                    references = curs.fetchall()
                    return str(references[0][0])
                else:
                    return None

            def getReferencedColumn(self):
                if self.hasReference():
                    curs.execute(SELECT_COLUMN_REFERENCES.format("'"+self.tableSchema+"'",
                                                                 "'"+self.tableName+"'",
                                                                 "'"+self.nameTb+"'"))
                    references = curs.fetchall()
                    return str(references[0][1])
                else:
                    return None

            def getCompleteColumn(self):
                columnStr = "\n\t"+self.getColNameObj()
                columnStr = columnStr + " = Column("
                #print(self.primaryKey)
                if self.nameTb is not None:
                    columnStr = columnStr + "'"+self.nameTb+"'" 
                if self.dataType is not None:
                    columnStr = columnStr + "," + self.getTypeObj()
                if self.hasReference():
                    columnStr = columnStr + "," +"ForeignKey("+"'"+self.getReferencedTable()+"."+self.getReferencedColumn()+"')"
                if self.columnKey in ('PRI','UNI'):
                    columnStr = columnStr + "," + self.getColumnKey()
                if self.nullable is not None:
                    columnStr = columnStr + "," + self.getNullable()
                if self.default is not None:
                    columnStr = columnStr + "," + self.getDefault()
                if self.comment is not None:
                    columnStr = columnStr + "," + self.getComment()
                return columnStr + ')'

        class Dict():
            class Register():
                def __init__ (self,key = None,value = None):
                    self.key = key
                    self.value = value

            def __init__ (self,parentObj = None,registers = None):
                self.parentObj = parentObj
                if registers is None:
                    self.registers = []
                else:
                    self.registers = []
                    self.registers.append(registers)
                self.setRegisters()

            def setRegisters (self):
                for column in self.parentObj.columns:
                    newRegister = self.Register(column.getColNameObj(),column.getColNameObj())
                    self.registers.append(newRegister)

            def getDict(self):
                dictStr = ""
                dictStr = dictStr + "\n\tdef getDict(self):\n"
                dictStr = dictStr + "\t\tself.dictionary = {}\n"
                for register in self.registers:
                    dictStr = dictStr + "\t\tself.dictionary['"+ register.key+"'] = self."+register.value+"\n"
                dictStr = dictStr + "\t\treturn self.dictionary"
                return dictStr

        class Repr():
            class Row():
                def __init__ (self,key = None,value = None):
                    self.key = key
                    self.value = value
                
            def __init__ (self,parentObj = None,header=None,rows=None):
                self.parentObj = parentObj
                self.header = parentObj.tablename[3:].capitalize()
                if rows is None:
                    self.rows = []
                else:
                    self.rows = []
                    self.rows.append(rows)
                self.setRows()
            
            def setRows (self):
                for column in self.parentObj.columns:
                    newRow = self.Row(column.nameTb,column.getColNameObj())
                    self.rows.append(newRow)

            def getRepr(self):
                reprStr = "\n\n\tdef __repr__(self):\n"
                reprStr = reprStr + "\t\treturn '''<"+self.header+"\n"
                i = 0
                for row in self.rows:
                    if i == 0:
                        reprStr = reprStr + "\t(" + row.key
                        reprStr = reprStr + "='{}'"
                    else:
                        reprStr = reprStr + ",\n"
                        reprStr = reprStr + "\t" + row.key
                        reprStr = reprStr + "='{}'"
                    i += 1
                reprStr = reprStr + ")>'''.format("
                i = 0
                for row in self.rows:
                    if i == 0:
                        reprStr = reprStr + "self." +row.value
                    else:
                        reprStr = reprStr + ",\nself."+row.value
                    i += 1
                reprStr = reprStr + ")"
                return reprStr

        class Relationship():
            def __init__ (self,name = None, relatedObj = None,
                               thisObj = None,back_populates = None):
                self.name = name
                self.thisObj = thisObj
                self.relatedObj = relatedObj
                self.back_populates = back_populates
        
        def __init__ (self,tablename = None,columns = None,
                        repr = None, dict = None,parentObj = None):
            self.tablename = tablename
            if columns is None:
                self.columns = []
            else:
                self.columns = []
                self.columns.append(columns)            
            if parentObj is not None:
                self.repr = self.Repr(self)
                self.dict = self.Dict(self)
            self.parentObj = parentObj

        def getName(self):
            objName = ''
            underlineList = []
            i = 1
            for char in self.tablename:
                if char == '_':
                    underlineList.append(i)
                i += 1

            for i in range(0,len(underlineList)):
                if i < len(underlineList) - 1:
                    partName = self.tablename[underlineList[i]:underlineList[i + 1] - 1]
                    objName = objName + partName.capitalize()
                else:
                    partName = self.tablename[underlineList[i]:]
                    objName = objName + partName.capitalize()

            return objName

        def setTablename(self,tablename):
            self.tablename = tablename

        def setColumns(self,columns):
            self.columns = columns
        
        def setRepr(self):
            self.repr = self.Repr(self)

        def setDict(self):
            self.dict = self.Dict(self)

        def setParentObj(self,parentObj):
            self.parentObj = parentObj

        def getTablename(self):
            return "\t__tablename__ = "+"'"+self.tablename+"' \n"

        def getObjName(self):
            return "\n\nclass "+self.getName()+"(Base):\n"
        
        def getRelationships(self):
            referenceList = []
            for mappedObject in self.parentObj.mappedObjects:
                if mappedObject != self: 
                    for column in self.columns:
                        if column.hasReference() and column.getReferencedTable() == mappedObject.tablename:                    
                            print("TABLE: "+self.tablename+" comp "+mappedObject.tablename)
                            newReference = self.Relationship(name =  mappedObject.getName().casefold(),
                                                             relatedObj = mappedObject,
                                                             thisObj = self,
                                                             back_populates = self.getName().casefold()+"_s")
                            referenceList.append(newReference)
            return referenceList

        def getIsReferencedBys (self):
            pass

    def __init__(self,fileDest = None,dbControl = None,dbMappedObjects = None,
                 dbCommands = None,imports = None,mappedObjects = None,
                 relationships = None):
        
        self.fileDest = fileDest
        self.dbControl = dbControl
        self.dbMappedObjects = dbMappedObjects
        self.dbCommands = dbCommands 
        if imports is None:
            self.imports = []
            self.imports.append(self.Import('sqlalchemy'))
            self.imports.append(self.Import('sqlalchemy.ext.declarative','declarative_base'))
            self.imports.append(self.Import('sqlalchemy','create_engine,ForeignKey'))
            self.imports.append(self.Import('sqlalchemy','Column,Integer,Boolean,SmallInteger,Numeric,String,Date,DateTime,Time,TIMESTAMP'))
            self.imports.append(self.Import('sqlalchemy','between,func,text,asc,desc,case'))
            self.imports.append(self.Import('sqlalchemy.orm','sessionmaker,relationship,aliased'))
            self.imports.append(self.Import('sqlalchemy.sql.functions','Function'))
            self.imports.append(self.Import('sqlalchemy.exc','SQLAlchemyError'))
        else:
            self.imports = []
            self.imports.append(imports)
        if mappedObjects is None:
            self.mappedObjects = []
        else:
            self.mappedObjects = []
            self.mappedObjects.append(mappedObjects)
        if relationships is None:
            self.relationships = []
        else:
            self.relationships = []
            self.relationships.append(relationships)
    
    def setMappedObjects(self,tables):
        print(dbase)
        for table in tables:
            for tablename in table:
                tableColumns = []
                curs.execute(SELECT_TABLE_COLUMNS.format("'"+dbase+"'","'"+tablename+"'"))
                newMappedObj = self.MappedObject()
                for row in curs.fetchall():
                    tableColumns.append(self.MappedObject.Column(nameTb = row[0],
                                                                 dataType = row[1],
                                                                 charMaxLength = row[2],
                                                                 numericPrecision = row[3],
                                                                 numericScale = row[4],
                                                                 nullable = row[5],
                                                                 default = row[6],
                                                                 comment = row[7],
                                                                 columnKey = row[8],
                                                                 tableSchema = row[9],
                                                                 tableName = row[10],
                                                                 parentObj = newMappedObj))
                newMappedObj.setTablename(tablename)
                newMappedObj.setColumns(tableColumns)
                newMappedObj.setRepr()
                newMappedObj.setDict()
                newMappedObj.setParentObj(self)
                self.mappedObjects.append(newMappedObj)
    
    def openFiles(self):
        self.dbControl = open(self.fileDest+"db_control.py","a",encoding="utf-8")
        self.dbControl.truncate(0)
        self.dbMappedObjects = open(self.fileDest+"db_mapped_objects.py","a",encoding="utf-8")
        self.dbMappedObjects.truncate(0)
        self.dbCommands = open(self.fileDest+"db_commands.py","a",encoding="utf-8")
        self.dbCommands.truncate(0)

    def closeFiles(self):
        self.dbControl.close()
        self.dbMappedObjects.close()
        self.dbCommands.close()

    def writeDbControl(self,content):
        self.dbControl.write(content)

    def writeDbMappedObjects(self,content):
        self.dbMappedObjects.write(content)

    def writeDbCommands(self,content):
        self.dbCommands.write(content)
    
    def writeFiles(self):
        self.openFiles()
        for imp in self.imports:
            self.writeDbControl(imp.getFullImport())

        self.writeDbControl("\n#Criando objeto de controle do banco de dados")
        self.writeDbControl("\nclass DbControl: ")
        self.writeDbControl("\n\tdef __init__(self,engine = None,session = None):")
        self.writeDbControl("\n\t\tself.engine = engine")
        self.writeDbControl("\n\t\tself.session = session")
        self.writeDbControl("\n\n\tdef startSession (self):")
        self.writeDbControl("\n\t\tSession = sessionmaker()")
        self.writeDbControl("\n\t\tSession.configure(bind = self.engine)")
        self.writeDbControl("\n\t\tself.session = Session()")
        self.writeDbControl("\n\n\tdef dbConnTest (self):")
        self.writeDbControl("\n\t\ttry:")
        self.writeDbControl("\n\t\t\tconn = self.engine.connect()")
        self.writeDbControl("\n\t\texcept SQLAlchemyError as err:")
        self.writeDbControl("\n\t\t\traise Exception('Erro ao se conectar com o banco de dados!')")
        self.writeDbControl("\n\n\tdef dbInit(self,url):")
        self.writeDbControl("\n\t\tself.engine = create_engine('mysql+mysqlconnector://'+url)")
        self.writeDbControl("\n\t\tself.dbConnTest()")
        self.writeDbControl("\n\t\tself.startSession()")

        self.writeDbMappedObjects("from db_control import *\n")
        self.writeDbMappedObjects("\nBase = declarative_base()\n\n")
        self.sortMappedObjects()
        for mappedObject in self.mappedObjects:
            self.writeDbMappedObjects(mappedObject.getObjName())
            self.writeDbMappedObjects(mappedObject.getTablename())
            for tableColumn in mappedObject.columns:
                self.writeDbMappedObjects(tableColumn.getCompleteColumn())
            self.writeDbMappedObjects("\n")
            for reference in mappedObject.getRelationships():
                self.writeDbMappedObjects("\n\t"+reference.name
                                                +" = relationship("+
                                                reference.relatedObj.getName()+
                                                ",back_populates = '"+reference.back_populates+
                                                "')")
            self.writeDbMappedObjects(mappedObject.repr.getRepr()+"\n")
            self.writeDbMappedObjects(mappedObject.dict.getDict()+"\n")
        self.writeDbMappedObjects("\n")
        for mappedObject in self.mappedObjects:
            for reference in mappedObject.getRelationships():
                self.writeDbMappedObjects("\n"+reference.relatedObj.getName()+"."+
                                          reference.thisObj.getName().casefold() + "_s" +" = "+
                                          "relationship('"+reference.thisObj.getName()+"',"+
                                          "back_populates = '"+reference.relatedObj.getName().casefold()+"')")
        self.writeDbCommands("from db_mapped_objects import *\n\n")
        self.writeDbCommands("class DbCommands():")
        self.writeDbCommands("\n\tdef __init__(self):")
        self.writeDbCommands("\n\t\tpass")

        self.closeFiles()

    def sortMappedObjects (self):
        for i in range(0,len(self.mappedObjects)):
            for u in range(i + 1,len(self.mappedObjects)):
                for relationship in self.mappedObjects[i].getRelationships():
                    if type(relationship.relatedObj) == type(self.mappedObjects[u]):
                        tempMappedObj = self.mappedObjects[i]
                        self.mappedObjects[i] = self.mappedObjects[u]
                        self.mappedObjects[u] = tempMappedObj
                        break 
                        

print("Informe o destino dos arquivos: ")
sqlAFile = PythonSQLAFile(fileDest = input())
        
curs.execute(SELECT_TABLES.format("'"+dbase+"'"))
tables = curs.fetchall()

sqlAFile.setMappedObjects(tables)

sqlAFile.writeFiles()