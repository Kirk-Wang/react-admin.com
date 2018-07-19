const React = require('react')
const { Container } = require('../../core/CompLibrary.js')
const { translate } = require('../../server/translate.js')
const siteConfig = require(process.cwd() + '/siteConfig.js')

module.exports = function Users () {
  const showcase = siteConfig.users.map((user, i) => (
    <a href={user.infoLink} key={i}>
      <img src={user.image} title={user.caption} />
    </a>
  ))

  return (
    <div className='mainContainer'>
      <Container padding={['bottom', 'top']}>
        <div className='showcaseSection'>
          <div className='prose'>
            <h1>
              <translate>Who's Using This?</translate>
            </h1>
            <p>
              <translate>This project is used by many folks</translate>
            </p>
          </div>
          <div className='logos'>{showcase}</div>
          <p>
            <translate>Are you using this project?</translate>
          </p>
          <a
            href={`${siteConfig.repoUrl}edit/master/website/siteConfig.js`}
            className='button'
          >
            <translate>Add your profile</translate>
          </a>
        </div>
      </Container>
    </div>
  )
}
