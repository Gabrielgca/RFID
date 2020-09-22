import mysql.connector as mysql
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, inch
from reportlab.platypus import SimpleDocTemplate,Table,TableStyle,Spacer,PageBreak
import textwrap

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
WHERE TABS.TABLE_SCHEMA = {}
AND TABS.TABLE_TYPE != 'VIEW' """

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

class DataDict:
    class Table:
        class Column:
            def __init__ (self,nameTb = None, dataType = None, charMaxLength = None,
                          numericPrecision = None, numericScale = None, nullable = False,
                          comment = None,columnKey = False, tableSchema = None,tableName = None,
                          parentObj = None):
                self.nameTb = nameTb
                self.dataType = dataType
                self.charMaxLength = charMaxLength
                self.numericPrecision = numericPrecision
                self.numericScale = numericScale
                self.nullable = nullable
                self.comment= comment
                self.columnKey = columnKey
                self.tableSchema = tableSchema
                self.tableName = tableName
                self.parentObj = parentObj
            def getNameTb(self):
                return self.nameTb

            def getColDesc(self):
                if self.dataType == 'int':
                    return {"type" : "INTEIRO",
                            "tamanho" : "4 bytes",
                            "decimal" : None}
                elif self.dataType == 'tinyint':
                    return {"type" : "BOOLEANO",
                            "tamanho" : None,
                            "decimal" : None}
                elif self.dataType == 'char':
                    return {"type" : "CHAR",
                            "tamanho" : str(self.charMaxLength),
                            "decimal" : None}
                elif self.dataType == 'varchar':
                    return {"type" : "CHAR VARIAVEL",
                            "tamanho" : str(self.charMaxLength),
                            "decimal" : None}
                elif self.dataType == 'decimal':
                    return {"type" : "DECIMAL",
                            "tamanho" : str(self.numericPrecision),
                            "decimal" : str(self.numericScale)}
                elif self.dataType == 'date':
                    return {"type" : "DATA",
                            "tamanho" : None,
                            "decimal" : None}
                elif self.dataType == 'time':
                    return {"type" : "TEMPO",
                            "tamanho" : None,
                            "decimal" : None}

            def hasReference (self):
                curs.execute(SELECT_COUNT_COL_REFERENCES.format("'"+self.tableSchema+"'",
                                                                "'"+self.tableName+"'",
                                                                "'"+self.nameTb+"'"))
                hasReference = curs.fetchall()
                if int(hasReference[0][0]) > 0:
                    return True
                else:
                    return False

            def getNullable(self):
                if self.nullable == 'NO':
                    return 'Não Anulável'
                else:
                    return ''

            def getColumnKeys(self):
                chavesStr = ''
                if self.columnKey == 'PRI':
                    chavesStr += 'Primária'
                elif self.columnKey == 'UNI':
                    if len(chavesStr) > 0:
                        chavesStr += ', \nÚnico'
                    else:
                        chavesStr += 'Único'
                if self.hasReference():
                    if len(chavesStr) > 0:
                        chavesStr += ', \nEstrangeira'
                    else:
                        chavesStr += 'Estrangeira'                
                if self.nullable == 'NO':
                    if len(chavesStr) > 0:
                        chavesStr += ', \nNão Anulável'
                    else:
                        chavesStr += 'Não Anulável'
                return chavesStr

            def getCountKeys(self):
                keyCount = 0
                if self.columnKey == 'PRI':
                    keyCount += 1
                elif self.columnKey == 'UNI':
                    keyCount += 1
                if self.hasReference():
                    keyCount += 1                
                if self.nullable == 'NO':
                    keyCount += 1
                return keyCount
            
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
                return self.comment
                if self.comment is not None:
                    if len(self.comment) > 0:
                        return 'comment = ' + self.formatComment(str(self.comment))
                    else:
                        return ''
                else:
                    return ''
            
        def __init__ (self,tablename = None,columns = None,parentObj = None):
            self.tablename = tablename
            if columns is None:
                self.columns = []
            else:
                self.columns = []
                self.columns.append(columns)            
            self.parentObj = parentObj    

        def setTablename(self,tablename):
            self.tablename = tablename

        def setColumns(self,columns):
            self.columns = columns

        def setParentObj(self,parentObj):
            self.parentObj = parentObj
    
    def __init__(self,fileDest = None,tables = None):
        
        self.fileDest = fileDest 
        if tables is None:
            self.tables = []
        else:
            self.tables = []
            self.tables.append(tables)
    
    def setTables(self,tables):
        for table in tables:
            for tablename in table:
                tableColumns = []
                curs.execute(SELECT_TABLE_COLUMNS.format("'"+dbase+"'","'"+tablename+"'"))
                newTable = self.Table()
                for row in curs.fetchall():
                    tableColumns.append(self.Table.Column(nameTb = row[0],
                                                                 dataType = row[1],
                                                                 charMaxLength = row[2],
                                                                 numericPrecision = row[3],
                                                                 numericScale = row[4],
                                                                 nullable = row[5],
                                                                 comment = row[7],
                                                                 columnKey = row[8],
                                                                 tableSchema = row[9],
                                                                 tableName = row[10],
                                                                 parentObj = newTable))
                newTable.setTablename(tablename)
                newTable.setColumns(tableColumns)
                newTable.setParentObj(self)
                self.tables.append(newTable)

    def breakComment(self,comment):
        splittedComments = []
        breakedComment = ''
        currComment = comment
        c = 0
        while c < 4000:
            c += 1
            if len(currComment) > 19: 
                for u in range(len(currComment) - 1,0,-1):
                    if currComment[u] == ' ':
                        splittedComments.append("\n"+currComment[u:])
                        currComment = currComment[0:u]
                        break
            else:
                splittedComments.append(currComment)
                break
        for i in range(len(splittedComments) - 1,0,-1):
            breakedComment += splittedComments[i]
        return breakedComment

    def sumRowHeight(self,rowHeights):
        sumHeight = 0
        for rowH in rowHeights:
            sumHeight += rowH
        return sumHeight

    def generatePdf(self):
        try:
            elements = []
            titleSeparator = [["\n\n\n\n"]]
            ts = Table(titleSeparator)
            #Inicializando arquivo pdf
            nomePdf = input('Informe o nome do arquivo a ser gerado:\n')
            pdf = SimpleDocTemplate('{}.pdf'.format(nomePdf),pagesize = letter) 
            pageWidth, pageHeigth = letter
            #Inicializando estilos da tabelas         
            titleStyle = TableStyle([('FONTSIZE',(0,0),(-1,-1),32),
                                     ('ALIGN',(0,0),(-1,-1),'CENTER'),
                                     ('VALIGN',(0,0),(-1,-1),'TOP')])
            headerStyle = TableStyle([('BACKGROUND',(0,0),(-1,-1),colors.blue),
                                      ('TEXTCOLOR',(0,0),(-1,-1),colors.white),
                                      ('ALIGN',(0,0),(-1,-1),'CENTER'),
                                      ('VALIGN',(0,0),(-1,-1),'MIDDLE')])
            tableHeadersStyle = TableStyle([('BACKGROUND',(0,0),(-1,-1),colors.blue),
                                            ('TEXTCOLOR',(0,0),(-1,-1),colors.white),
                                            ('ALIGN',(0,0),(-1,-1),'CENTER'),
                                            ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                                            ('INNERGRID',(0,0),(-1,-1),0.25,colors.black),
                                            ('BOX',(0,0),(-1,-1),0.25,colors.black)])
            tableContentStyle = TableStyle([('ALIGN',(0,0),(-1,-1),'CENTER'),
                                            ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                                            ('INNERGRID',(0,0),(-1,-1),0.25,colors.black),
                                            ('BOX',(0,0),(-1,-1),0.25,colors.black)])
            #Inicializando quebras de textos
            titleWrapper = textwrap.TextWrapper(width=35)
            fieldWrapper = textwrap.TextWrapper(width=21)
            title = input('Informe o título do documento:\n')
            wrappedTitle = titleWrapper.wrap(text=title)
            i = 0
            titleData = []
            for row in wrappedTitle:
                #print(row)
                titleData.append([row])
                i += 1
            t = Table(titleData,rowHeights=i*[0.5*inch])
            totalHeight = self.sumRowHeight(t._rowHeights)
            t.setStyle(titleStyle)
            elements.append(t)
            elements.append(ts)
            i = 0
            for table in self.tables:
                #print("Altura total: "+str(totalHeight)+" Cálculo: "+str((totalHeight // (500 +(40 * (totalHeight // 500) + 1)) + 1) * 500 - totalHeight)+" Quebrou linha: "+str((totalHeight // (500 +(40 * (totalHeight // 500) + 1)) + 1) * 500 - totalHeight <= 0))
                #if (totalHeight // (500 +(40 * (totalHeight // 500) + 1)) + 1) * 500 - totalHeight <= 0:
                #    elements.append(PageBreak())
                #    totalHeight = 0

                headerData = [['TABELA: '+table.tablename]]
                th1 = Table(headerData,colWidths=1*[6.65*inch], rowHeights=1 * [0.25*inch])
                th1.setStyle(headerStyle)
                tableHeaders = [['CAMPO','CHAVES','TIPO','TAMANHO','DECIMAL','DESCRIÇÃO']]
                th2 = Table(tableHeaders,colWidths=1 * [1.5*inch] + 1 * [1.0*inch] + 1 * [1.25*inch] + 1 * [0.75*inch] + 1 * [0.65*inch] + 1 * [1.5*inch],
                                       rowHeights=1 * [0.25*inch])
                th2.setStyle(tableHeadersStyle)
                print("Altura total: ")
                print(self.sumRowHeight(th1._rowHeights) + self.sumRowHeight(th2._rowHeights) + totalHeight)
                print("Altura threshold: ")
                print((totalHeight // 540 + 1) * 520)
                if  (self.sumRowHeight(th1._rowHeights) + self.sumRowHeight(th2._rowHeights) + totalHeight) - ((totalHeight // 550) * 550) > (totalHeight // 550 + 1) * 520:
                    elements.append(PageBreak())
                elements.append(th1)
                elements.append(th2)
                totalHeight += self.sumRowHeight(th1._rowHeights) + self.sumRowHeight(th2._rowHeights)
                for col in table.columns:
                    colData = []
                    tableContent = []
                    colData.append(fieldWrapper.fill(text=col.getNameTb()))
                    colData.append(col.getColumnKeys())
                    colDesc = col.getColDesc()
                    colData.append(colDesc['type'])
                    colData.append(colDesc['tamanho'])
                    colData.append(colDesc['decimal'])
                    rowCount = col.getCountKeys()
                    if rowCount < len(fieldWrapper.wrap(text=col.getComment())):
                        rowCount = len(fieldWrapper.wrap(text=col.getComment()))
                    colData.append(fieldWrapper.fill(text=col.getComment()))
                    tableContent.append(colData)               
                    t = Table(tableContent,colWidths=1 * [1.5*inch] + 1 * [1.0*inch] + 1 * [1.25*inch] + 1 * [0.75*inch] + 1 * [0.65*inch] + 1 * [1.5*inch],
                                           rowHeights=1 * [0.25*rowCount*inch])
                    t.setStyle(tableContentStyle)
                    elements.append(t)
                    totalHeight += self.sumRowHeight(t._rowHeights)
                #print("Altura total: "+str(totalHeight)+" Resto da divisão: "+str(totalHeight % 500))
                #print(table.tablename)
                i += 1
            pdf.build(elements)
        except Exception as e:
            print(e)
            print('Erro ao gerar arquivo!')

dataDictFile = DataDict()

curs.execute(SELECT_TABLES.format("'"+dbase+"'"))
tables = curs.fetchall()

dataDictFile.setTables(tables)

dataDictFile.generatePdf()

