import { useState, useEffect } from 'react';
const logos = {
    mongodb: 'mongodb', mongo: 'mongodb', vite: 'vite', vitejs: 'vite', typescript: 'typescript', ts: 'typescript', tailwind: 'tailwind', tailwindcss: 'tailwind', heroku: 'heroku', railway: 'railway',
    jenkins: 'jenkins', selenium: 'selenium', playwright: 'playwright', pytest: 'pytest', sonarqube: 'sonarqube', junit: 'junit', junit5: 'junit',
    python: 'python', javascript: 'javascript', js: 'javascript', java: 'java',
    spring: 'spring', springboot: 'spring', sqlserver: 'sqlserver', microsoftsqlserver: 'sqlserver', mssql: 'sqlserver',
    oracle: 'oracle', oracledatabase: 'oracle', php: 'php', laravel: 'laravel',
    'c#': 'csharp', csharp: 'csharp', aspnetcore: 'aspnet', aspnet: 'aspnet', netcore: 'aspnet', dotnet: 'aspnet',
    react: 'react', reactjs: 'react', express: 'express', expressjs: 'express', nodejs: 'nodejs', node: 'nodejs',
    postgresql: 'postgresql', postgres: 'postgresql', docker: 'docker', ionic: 'ionic', ionicframework: 'ionic', angular: 'angular', angularjs: 'angular',
    grafana: 'grafana', powerbi: 'powerbi', pbi: 'powerbi',
    cisco: 'cisco', udemy: 'udemy', reactnative: 'react',
};
export function technologyLogoName(name) { return logos[name.toLowerCase().replace(/[\s.\-_]/g, '')] || null }
export default function TechnologyLogo({ name }) {
    const logo = technologyLogoName(name), [failed, setFailed] = useState(false);
    useEffect(() => setFailed(false), [logo]);
    return <span className={'technology-logo ' + (logo ? 'logo-' + logo : 'logo-custom')} aria-hidden="true">{logo && !failed ? <img src={'/technology-logos/' + logo + '.svg'} alt="" width="30" height="30" loading="lazy" onError={() => setFailed(true)} /> : <span className="technology-monogram">{name.trim().slice(0, 2).toUpperCase()}</span>}</span>
}
