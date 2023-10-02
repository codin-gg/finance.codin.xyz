<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:html="http://www.w3.org/1999/xhtml" version="2.0">
  <xsl:template match="/">
    <html>
      <head>
        <title>Candles</title>
        <style>
          <![CDATA[
            body {
              font-family: sans-serif;
            }
            h1 {
              font-size: 1.5em;
              font-weight: bold;
            }
            ul {
              list-style-type: none;
              padding: 0;
            }
            li {
              padding: 0.5em;
              border-bottom: 1px solid #ccc;
            }
            li:hover {
              background-color: #eee;
            }
            li strong {
              display: inline-block;
              width: 10em;
            }
          ]]>
        </style>
      </head>
      <body>
        <h1>Candles</h1>
        <ul>
          <xsl:for-each select="candles/candle">
            <li>
              date: <strong><xsl:value-of select="date"/></strong>
              open: <strong><xsl:value-of select="open"/></strong>
              high: <strong><xsl:value-of select="high"/></strong>
              low: <strong><xsl:value-of select="low"/></strong>
              close: <strong><xsl:value-of select="close"/></strong>
              volume: <strong><xsl:value-of select="volume"/></strong>
            </li>
          </xsl:for-each>
        </ul>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
