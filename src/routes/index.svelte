{#if Object.keys($user).length === 0}
	<section style="height: 100vh; border-bottom: 1px solid #eee;">
		<div style="height: 84vh; display: flex; justify-content: center; align-items: center;">
			<div style="padding-bottom: 90px;">
				<div style="display: flex; align-items: center; justify-content: center; height: 120px;">
					<img src="logo.png" width="120" height="108" style="margin-left: 0px;">
					<h1 id="logo" style="font-size: 6.5rem; color: rgb(0 0 0); padding-bottom: 16px; padding-left: 10px;">
						explain.mit.edu
					</h1>
				</div>

				<div style="display: flex; justify-content: center;">
					<b style="color: grey; white-space: nowrap;" class="copied-from-koa">An explanation platform based on voice chat and blackboards</b>
				</div>

				<!-- This flex is just used to center horizontally -->
				<div style="display: flex; justify-content: center">
					<div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; width: 500px;">
						<div>
							<div class="copied-from-koa-2" style="margin-top: 20px;">For ASE exams:</div>
							<div class="copied-from-koa-2" style="margin-top: 20px;">For semester classes:</div>
							<div class="copied-from-koa-2" style="margin-top: 50px;">For open-learning:</div>
						</div>

						<div style="width: 300px;">
							<div style="margin-top: 20px;">
								<Button on:click={() => goto('ase')} variant="outlined" style="width: 47%; color: black">
									Student
								</Button>

								<Button on:click={() => goto('teach')} variant="outlined" style="margin-left: 7px; width: 47%; color: purple;">
									Tutor
								</Button>
							</div>

							<div style="margin-top: 14px;">
								<Button on:click={() => goto('class-material')} variant="outlined" color="primary" style="width: 47%; color: black">
									Instructor
								</Button>	
								<Button width={100} on:click={() => goto('class-material')} variant="outlined" style="margin-left: 7px; width: 47%; color: purple">
									TA
								</Button>	
							</div>

							<div style="margin-top: 44px;">
								<Button on:click={() => goto('explore')} variant="outlined" color="orange" style="width: 47%; color: black">
									join server
								</Button>	
								<Button on:click={() => goto('explore')} variant="outlined" style="margin-left: 7px; color: purple">
									start server
								</Button>	
							</div>
						</div>
					</div>
					<!-- <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;"> -->
				
					<!-- </div> -->
					<div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
				</div>
			</div>
		</div>
	</section>
{/if}

<script>	
	import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
	import Button, { Label } from '@smui/button';
	import HelperText from '@smui/textfield/helper-text'
	import Textfield from '@smui/textfield';
	import { onMount, tick, onDestroy } from 'svelte'
	import { goto } from '$app/navigation'
	import { canvasHeight, canvasWidth, user, recordState } from '../store.js'
	import Blackboard from '$lib/Blackboard.svelte'
	import DoodleVideo from '$lib/DoodleVideo.svelte'
	import RenderlessAudioRecorder from '$lib/RenderlessAudioRecorder.svelte'
	import RenderlessListenToBoard from '$lib/RenderlessListenToBoard.svelte'
	import { calculateCanvasDimensions2 } from '../helpers/canvas.js'
	import RenderlessFetchStrokes from '$lib/RenderlessFetchStrokes.svelte'

	let currentTime = 10
	let titleValue = 'Welcome!'
	let i = 0
	let typewriter

	let phoneNumSegment1 = ''
	let phoneNumSegment2 = ''
	let phoneNumSegment3 = ''
	let phoneConfirmationResult
	let phoneConfirmCode = ''

	let appVerifier
	const print = console.log
	let hasClickedTitle = false
	$: isQuestionMode = '?' === titleValue.charAt(titleValue.length - 1)
	let hasWatchedExemplar = false
	let hasRecordedVideo = false
	let localStrokesArray = []
	let audioBlobURL = ''
	let hasWatchedVideo = false
	let timer
	let demoStrokesArray = []

	function startTypingAnimation () {
		titleValue = ''
		const values = [
			'Gradient descent',
			'Finals 2019',
			'RNN example',
			"Explain 2b visually",
		]
		typewriter = setInterval(() => {
			titleValue = values[i]
			i += 1
			if (i === values.length) {
				clearInterval(typewriter)
			}
		}, 300)
	}

	$: if (isQuestionMode) {
		setTimeout(() => {
			hasWatchedExemplar = true
		}, 5000)
	}

	$: if (currentTime.toFixed(0) === '0') {
		console.log('end of timer, currentTime =', currentTime)
		clearInterval(timer)
	}

	$: if (hasWatchedVideo) {
		tick().then(() => {
			const elem = document.getElementById('sign-up-section')
			elem.scrollIntoView({ 
				block: "center", // vertical alignment
				inline: "nearest", // horizontal alignment
				// behavior: "smooth"
			})
		})
	}


	$: if (phoneNumSegment1.length === 3) {
		document.getElementById('phone-input-2').focus()
	}
	$: if (phoneNumSegment2.length === 3) {
		document.getElementById('phone-input-3').focus()
	}

	$: if (phoneNumSegment3.length === 4) {
		signInWithPhone()
	}

	$: if (phoneConfirmCode) {
		if (phoneConfirmCode.length === 6) {
			verifyConfirmationCode()
		}
	}

	function adjustContentDimensions () {
		const { width, height } = calculateCanvasDimensions2()
		canvasWidth.set(width) 
		canvasHeight.set(height)
	}

	onMount(() => {
		window.addEventListener('resize', adjustContentDimensions)
		adjustContentDimensions()
	})

	onDestroy(() => {
		window.removeEventListener('resize', adjustContentDimensions)
	})

	async function startRealtimeDemo (element, strokesArray) {
		for (const stroke of strokesArray) {
			demoStrokesArray = [...demoStrokesArray, stroke]
			await new Promise(resolve => setTimeout(resolve, 200));
		}
	}

	function saveVideoLocally (audioBlob) {
		audioBlobURL = URL.createObjectURL(audioBlob)
		hasRecordedVideo = true
		setTimeout(() => hasWatchedVideo = true, 5000)
		// quick-fix, otherwise when user logs in to a real server their blackboard is *shown* to be uploading for some reason
		recordState.set('pre_record')
	}

	function startRecordCountdown (element) {
		timer = setInterval(() => currentTime -= 1, 1000)	
	}

	function signInWithPhone () {
		if (!window.recaptchaVerifier) {
			window.recaptchaVerifier = new RecaptchaVerifier('sign-in-button', {
				'size': 'invisible',
				'callback': (response) => {
					// reCAPTCHA solved, allow signInWithPhoneNumber.
					console.log('reCAPTCHA solved =', response)
					// onSignInSubmit()
				}
			}, getAuth())
			appVerifier = window.recaptchaVerifier;
		}

		onSignInSubmit();

		function onSignInSubmit () {
			const phoneNumber = `+1 ${phoneNumSegment1}-${phoneNumSegment2}-${phoneNumSegment3}`
			print(getAuth(), phoneNumber, appVerifier)
			signInWithPhoneNumber(getAuth(), phoneNumber, appVerifier)
				.then((confirmationResult) => {
					console.log('confirmation result =', confirmationResult)
					phoneConfirmationResult = confirmationResult

					// SMS sent. Prompt user to type the code from the message, then sign the
					// user in with confirmationResult.confirm(code).
					window.confirmationResult = confirmationResult
					// ...
				}).catch((error) => {
					alert(error)
					console.log('error =', error)
					// Error; SMS not sent
					// ...
			
					// if it fails, reset 
					// grecaptcha.reset(window.recaptchaWidgetId);
			
					// Or, if you haven't stored the widget ID:
					window.recaptchaVerifier.render().then(function(widgetId) {
						grecaptcha.reset(widgetId);
					})
				});
			}
		}

		// SIGN IN WITH CONFIRMATION CODE
		function verifyConfirmationCode () {
			console.log('phoneConfirmCode =', phoneConfirmCode)
			window.confirmationResult.confirm(phoneConfirmCode).then((result) => {
				// User signed in successfully.
				const user = result.user;
				console.log('redirecting, user =', user)
				goto('/O00mSbBEYQxTnv3cKkbe/O00mSbBEYQxTnv3cKkbe', { replaceState: true })
				// goto('AsUl1VWQ7zzxZsD5epL7/AsUl1VWQ7zzxZsD5epL7', { replaceState: true })
				// ...
			}).catch((error) => {
				alert(error)
				// User couldn't sign in (bad verification code?)
				// ...
			});
	}
</script>

<style>
:global(.room-title input) {
  font-size: 2rem;
}

:global(.question input) {
  color: rgb(19, 145, 230) !important
}

.copied-from-koa {
	font: 34px/1.7 "Lucida Grande", "Lucida Sans Unicode", Helvetica, Arial, Verdana, sans-serif
}

.copied-from-koa-2 {
	font: 17px/1.7 "Lucida Grande", "Lucida Sans Unicode", Helvetica, Arial, Verdana, sans-serif;
	font-weight: 600;
	color: grey;
}

#logo {
	/* NOTE: this font-size is overriden on top so doesn't do anything! */
    font: 300px 'Italiana', sans-serif;
    text-transform: lowercase;
}

.content {
	margin: 0 auto;
	/* min-width: 750px; 
	max-width: 750px; */
	text-align: left;
}

li {
	margin-bottom: 2px;
}

#make-your-own-video {

}

</style>

<!-- 	<picture>
				<source srcset="svelte-welcome.webp" type="image/webp" />
				<img src="svelte-welcome.png" alt="Welcome" />
			</picture> -->
<!-- 
<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 1;
	}

	h1 {
		width: 100%;
	}

	.welcome {
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 495 / 2048) 0;
	}

	.welcome img {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		display: block;
	}
</style> -->
