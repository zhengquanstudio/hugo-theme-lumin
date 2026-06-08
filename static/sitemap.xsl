<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<xsl:stylesheet version="2.0"
  xmlns:html="http://www.w3.org/TR/REC-html40"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
<xsl:template match="/">
  <html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <title><xsl:value-of select="/sitemap:urlset/sitemap:url[1]/loc"/> Sitemap</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #334155; padding: 24px; }
      .container { max-width: 900px; margin: 0 auto; }
      h1 { font-size: 1.5rem; margin-bottom: 4px; color: #1e293b; }
      .meta { color: #64748b; font-size: 0.85rem; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
      th { background: linear-gradient(135deg,#3b82f6,#6366f1); color: #fff; padding: 12px 16px; text-align: left; font-size: .85rem; font-weight: 600; letter-spacing: .3px; text-transform: uppercase; }
      td { padding: 10px 16px; border-bottom: 1px solid #f1f5f9; font-size: .88rem; line-height: 1.5; word-break: break-all; }
      tr:hover td { background: #f8fafc; }
      tr:last-child td { border-bottom: none; }
      .url { color: #3b82f6; text-decoration: none; }
      .url:hover { text-decoration: underline; }
      .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: .75rem; font-weight: 500; }
      .badge-high { background: #dcfce7; color: #166534; }
      .badge-mid { background: #fef3c7; color: #92400e; }
      .badge-low { background: #f1f5f9; color: #475569; }
      .freq-daily { background: #dbeafe; color: #1e40af; }
      .freq-weekly { background: #ede9fe; color: #5b21b6; }
      .freq-monthly { background: #fce7f3; color: #9d174d; }
      .stats { display: flex; gap: 20px; margin-top: 16px; flex-wrap: wrap; }
      .stat-card { background: #fff; padding: 14px 20px; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,.06); flex: 1; min-width: 140px; }
      .stat-num { font-size: 1.6rem; font-weight: 700; color: #3b82f6; }
      .stat-label { font-size: .78rem; color: #94a3b8; margin-top: 2px; }
      @media (max-width: 600px) { body { padding: 12px; } td,th { padding: 8px 10px; } .stat-card { min-width: 100px; } }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>🗺️ Site Map</h1>
      <p class="meta"><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/> URLs · <a href="/index.xml" style="color:#3b82f6;text-decoration:none">RSS Feed</a></p>

      <div class="stats">
        <div class="stat-card"><div class="stat-num"><xsl:value-of select="count(sitemap:urlset/sitemap:url[sitemap:priority &gt;= 0.7])"/></div><div class="stat-label">High Priority</div></div>
        <div class="stat-card"><div class="stat-num"><xsl:value-of select="count(sitemap:urlset/sitemap:url[sitemap:priority &gt; 0.4 and sitemap:priority &lt; 0.7])"/></div><div class="stat-label">Medium Priority</div></div>
        <div class="stat-card"><div class="stat-num"><xsl:value-of select="count(sitemap:urlset/sitemap:url[sitemap:priority &lt;= 0.4])"/></div><div class="stat-label">Low Priority</div></div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width:50%">URL</th>
            <th style="width:18%">Last Modified</th>
            <th style="width:14%">Priority</th>
            <th style="width:18%">Change Freq</th>
          </tr>
        </thead>
        <tbody>
          <xsl:for-each select="sitemap:urlset/sitemap:url">
            <tr>
              <td><a href="{sitemap:loc}" class="url" target="_blank"><xsl:value-of select="sitemap:loc"/></a></td>
              <td><xsl:value-of select="substring(sitemap:lastmod, 1, 10)"/></td>
              <td>
                <xsl:attribute name="class">badge
                  <xsl:choose>
                    <xsl:when test="sitemap:priority &gt;= 0.7"> badge-high</xsl:when>
                    <xsl:when test="sitemap:priority &gt;= 0.4"> badge-mid</xsl:when>
                    <xsl:otherwise> badge-low</xsl:otherwise>
                  </xsl:choose>
                </xsl:attribute>
                <xsl:value-of select="concat(sitemap:priority * 100, '%')"/>
              </td>
              <td>
                <xsl:attribute name="class">badge
                  <xsl:choose>
                    <xsl:when test="sitemap:changefreq = 'daily'"> freq-daily</xsl:when>
                    <xsl:when test="sitemap:changefreq = 'weekly'"> freq-weekly</xsl:when>
                    <xsl:when test="sitemap:changefreq = 'monthly'"> freq-monthly</xsl:when>
                  </xsl:choose>
                </xsl:attribute>
                <xsl:value-of select="sitemap:changefreq"/>
              </td>
            </tr>
          </xsl:for-each>
        </tbody>
      </table>
    </div>
  </body>
  </html>
</xsl:template>
</xsl:stylesheet>
