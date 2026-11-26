const logos = {
    'desarrollodeapi': 'api', microservicios: 'microservices', desarrollodesoftware: 'software',
    'análisisdedatos': 'analytics', cienciadedatos: 'data-science',
    sqlservermanagementstudio: 'sqlserver', 'sqlserverintegrationservices(ssis)': 'ssis',
    scrum: 'scrum', 'seguridadderedes': 'network-security', cyberseguridad: 'cybersecurity',
    notion: 'notion', n8n: 'n8n', cloudflare: 'cloudflare', firebase: 'firebase',
    javaservlet: 'java', normasiso: 'iso',
    'arquitecturaorientadaaservicios(soa)': 'soa',

    expo: 'expo', prisma: 'prisma', xml: 'xml', css: 'css', css3: 'css',
    mongodb: 'mongodb', mongo: 'mongodb', vite: 'vite', vitejs: 'vite', typescript: 'typescript', ts: 'typescript', tailwind: 'tailwind', tailwindcss: 'tailwind', heroku: 'heroku', railway: 'railway',
    jenkins: 'jenkins', selenium: 'selenium', playwright: 'playwright', pytest: 'pytest', sonarqube: 'sonarqube', junit: 'junit', junit5: 'junit',
    python: 'python', javascript: 'javascript', js: 'javascript', java: 'java',
    spring: 'spring', springboot: 'spring', sqlserver: 'sqlserver', microsoftsqlserver: 'sqlserver', mssql: 'sqlserver',
    oracle: 'oracle', oracledatabase: 'oracle', php: 'php', laravel: 'laravel',
    'c#': 'csharp', csharp: 'csharp', aspnetcore: 'aspnet', aspnet: 'aspnet', netcore: 'aspnet', dotnet: 'aspnet',
    react: 'react', reactjs: 'react', express: 'express', expressjs: 'express', nodejs: 'nodejs', node: 'nodejs',
    postgresql: 'postgresql', postgres: 'postgresql', docker: 'docker', ionic: 'ionic', ionicframework: 'ionic', angular: 'angular', angularjs: 'angular',
    grafana: 'grafana', powerbi: 'powerbi', pbi: 'powerbi',
    odoo: 'odoo', phpmyadmin: 'phpmyadmin', vercelv0: 'v0', v0: 'v0',
    html: 'html', html5: 'html', bootstrap: 'bootstrap', jquery: 'jquery', blazor: 'blazor', mysql: 'mysql', tomcat: 'tomcat', eclipse: 'eclipse', git: 'git', github: 'github', linux: 'linux', trello: 'trello', jira: 'jira',
    cisco: 'cisco', udemy: 'udemy', reactnative: 'react',
};
export function technologyLogoName(name) { return logos[name.toLowerCase().replace(/[\s.\-_]/g, '')] || null }

const fallbackPalette = ['#7C3AED', '#0369A1', '#BE185D', '#0F766E', '#B45309', '#4338CA'];
export function technologyFallback(name) {
  const value = name.trim();
  const hash = Array.from(value.toLowerCase()).reduce((sum, char) => (sum * 31 + char.codePointAt(0)) >>> 0, 0);
  return { initial: Array.from(value)[0]?.toUpperCase() || '?', color: value.toLowerCase() === 'scrum' ? '#7C3AED' : fallbackPalette[hash % fallbackPalette.length] };
}
