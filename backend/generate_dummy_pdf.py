import PyPDF2

writer = PyPDF2.PdfWriter()
writer.add_blank_page(width=72, height=72)
with open('test.pdf', 'wb') as f:
    writer.write(f)
print('Dummy PDF created')
