const React = require('react')
const { translate } = require('../../server/translate.js')
const siteConfig = require(process.cwd() + '/siteConfig.js')

class Button extends React.Component {
  render () {
    return (
      <div className='pluginWrapper buttonWrapper'>
        <a className='button' href={this.props.href} target={this.props.target}>
          {this.props.children}
        </a>
      </div>
    )
  }
}

Button.defaultProps = {
  target: '_self'
}

function HomeSplash ({ language }) {
  return (
    <div className='homeContainer'>
      <div className='homeSplashFade'>
        <div className='wrapper homeWrapper'>
          <div className='projectLogo'>
            <img src={siteConfig.baseUrl + 'img/bg_home.png'} />
          </div>
          <div className='inner'>
            <h2 className='projectTitle'>
              {siteConfig.title}
              <small>{siteConfig.tagline}</small>
            </h2>
            <div className='section promoSection'>
              <div className='promoRow'>
                <div className='pluginRowBlock'>
                  <Button
                    href={`${siteConfig.baseUrl}docs/${language}/intro.html`}
                    class='red'
                  >
                    <translate>Docs</translate>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

module.exports = function Index ({ language }) {
  language = language || 'zh-CN'

  return (
    <div>
      <HomeSplash language={language} />
    </div>
  )
}
