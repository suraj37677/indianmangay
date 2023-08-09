const debug = require('debug')('transcription:routes:token');
const express = require('express');
const router = express.Router();
const S3O = require('s3o-middleware');

const keys = require('../bin/lib/keys');

router.use(S3O);

router.get('/generate', (req, res) => {
	
	keys.create({ owner : res.locals.s3o_username })
		.then(token => {
			debug(token);

			res.json({
				token,
				owner: res.locals.s3o_username
			});

		})
		.catch(err => {
			debug(err);
			res.status(500);
			res.json({
				status : 'error',
				reason : err
			});
		})
	;

});

router.get('/revoke/:token', (req, res) => {
	
	const tokenToRevoke = req.params.token;

	debug(`Revoking:`, tokenToRevoke);

	keys.check(tokenToRevoke)
		.then(checkedToken => {
			
			if(checkedToken.isValid){

				keys.disable(tokenToRevoke)
					.then(function(){
						
						res.json({
							status : "ok",
							message: `The token ${tokenToRevoke} has been successfully revoked`
						});

					})
					.catch(err => {
						debug(err);
						res.status(500);
						res.json({
							status : 'error',
							reason : err
						});
					});
				;

			} else {
				res.status(500);
				res.json({
					status : 'error',
					reason : 'The token passed for revocation is not valid'
				});
			}

		})
		.catch(err => {
			res.status(500);
			res.json({
				status : 'error',
				reason : err
			});
		})
	;

});

module.exports = router;