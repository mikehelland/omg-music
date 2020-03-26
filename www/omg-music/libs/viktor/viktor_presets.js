// these could be in the main database as synth patches?
if (typeof omg === "undefined") {
	var omg = {}
}

omg.synthPresets = {

	"Underwater Bass Lead": {
		"version": 4,
		"daw": {
			"pitch": {
				"bend": 0
			},
			"modulation": {
				"rate": 0
			},
			"delay": {
				"time": 570,
				"feedback": 0.45,
				"dry": 0.84,
				"wet": 0.5875
			},
			"reverb": {
				"level": 0.36
			},
			"masterVolume": {
				"level": 1
			}
		},
		"instruments": {
			"synth": {
				"polyphony": {
					"voiceCount": 1,
					"sustain": 1
				},
				"modulation": {
					"waveform": 0,
					"portamento": 0.006666666666666666,
					"rate": 0
				},
				"oscillator": {
					"osc1": {
						"range": -1,
						"fineDetune": 0,
						"waveform": 2
					},
					"osc2": {
						"range": -2,
						"fineDetune": 0,
						"waveform": 2
					},
					"osc3": {
						"range": -3,
						"fineDetune": 0,
						"waveform": 3
					}
				},
				"mixer": {
					"volume1": {
						"enabled": 0,
						"level": 0.2
					},
					"volume2": {
						"enabled": 1,
						"level": 0.16
					},
					"volume3": {
						"enabled": 1,
						"level": 0.08
					}
				},
				"noise": {
					"enabled": 0,
					"level": 0.17,
					"type": 0
				},
				"envelopes": {
					"primary": {
						"attack": 0,
						"decay": 0.002,
						"sustain": 1,
						"release": 0.02
					},
					"filter": {
						"attack": 1.3,
						"decay": 1.44,
						"sustain": 0.001,
						"release": 0.02
					}
				},
				"filter": {
					"cutoff": 2640,
					"emphasis": 8.8,
					"envAmount": 1
				},
				"lfo": {
					"waveform": 0,
					"rate": 6,
					"amount": 0
				},
				"pitch": {
					"bend": 0
				}
			}
		}
	},
	"Cut through that Mix": {
		"version": 5,
		"daw": {
			"pitch": {
				"bend": 0
			},
			"modulation": {
				"rate": 0
			},
			"delay": {
				"time": 450,
				"feedback": 0.54,
				"dry": 1,
				"wet": 0.31
			},
			"reverb": {
				"level": 0
			},
			"masterVolume": {
				"level": 0.56
			}
		},
		"instruments": {
			"synth": {
				"polyphony": {
					"voiceCount": 1,
					"sustain": 0
				},
				"modulation": {
					"waveform": 0,
					"portamento": 0.003333333333333333,
					"rate": 0
				},
				"oscillator": {
					"osc1": {
						"range": 0,
						"fineDetune": 0,
						"waveform": 2
					},
					"osc2": {
						"range": 0,
						"fineDetune": -1.5009380863040178,
						"waveform": 2
					},
					"osc3": {
						"range": 2,
						"fineDetune": -2.5015634771732493,
						"waveform": 2
					}
				},
				"mixer": {
					"volume1": {
						"enabled": 1,
						"level": 0.69
					},
					"volume2": {
						"enabled": 1,
						"level": 0.97
					},
					"volume3": {
						"enabled": 1,
						"level": 0.35
					}
				},
				"noise": {
					"enabled": 0,
					"type": 0,
					"level": 0.2
				},
				"envelopes": {
					"primary": {
						"attack": 0,
						"decay": 0.002,
						"sustain": 1,
						"release": 0
					},
					"filter": {
						"attack": 0.5,
						"decay": 0.5,
						"sustain": 0.5,
						"release": 0.1
					}
				},
				"filter": {
					"cutoff": 4800,
					"emphasis": 2,
					"envAmount": 0
				},
				"lfo": {
					"waveform": 0,
					"rate": 1,
					"amount": 0
				},
				"pitch": {
					"bend": 0
				}
			}
		}
	},
	"Meet her at the Love Parade": {
		"daw": {
			"pitch": {
				"bend": {
					"value": 0,
					"range": [-200, 200]
				}
			},
			"modulation": {
				"rate": {
					"value": 0,
					"range": [0, 15]
				}
			},
			"delay": {
				"time": {
					"value": 450,
					"range": [0, 1000]
				},
				"feedback": {
					"value": 0.54,
					"range": [0, 0.9]
				},
				"dry": {
					"value": 1,
					"range": [0, 1]
				},
				"wet": {
					"value": 0.31,
					"range": [0, 1]
				}
			},
			"reverb": {
				"level": {
					"value": 0,
					"range": [0, 1]
				}
			},
			"masterVolume": {
				"level": {
					"value": 0.56,
					"range": [0, 1]
				}
			}
		},
		"instruments": {
			"synth": {
				"modulation": {
					"waveform": {
						"value": 0,
						"range": [0, 5]
					},
					"portamento": {
						"value": 0.003333333333333333,
						"range": [0, 0.16666666666666666]
					},
					"rate": {
						"value": 0,
						"range": [0, 15]
					}
				},
				"oscillator": {
					"osc1": {
						"range": {
							"value": 0,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 2,
							"range": [0, 5]
						}
					},
					"osc2": {
						"range": {
							"value": 0,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 3,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 2,
							"range": [0, 5]
						}
					},
					"osc3": {
						"range": {
							"value": 0,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": -4,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 2,
							"range": [0, 5]
						}
					}
				},
				"mixer": {
					"volume1": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.69,
							"range": [0, 1]
						}
					},
					"volume2": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.97,
							"range": [0, 1]
						}
					},
					"volume3": {
						"enabled": {
							"value": 0,
							"range": [0, 1]
						},
						"level": {
							"value": 0.09,
							"range": [0, 1]
						}
					}
				},
				"noise": {
					"enabled": {
						"value": 0,
						"range": [0, 1]
					},
					"type": {
						"value": 0,
						"range": [0, 2]
					},
					"level": {
						"value": 0.2,
						"range": [0, 1]
					}
				},
				"envelopes": {
					"primary": {
						"attack": {
							"value": 0,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.002,
							"range": [0.002, 2]
						},
						"sustain": {
							"value": 1,
							"range": [0, 1]
						},
						"release": {
							"value": 0,
							"range": [0, 2]
						}
					},
					"filter": {
						"attack": {
							"value": 0.5,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.5,
							"range": [0, 2]
						},
						"sustain": {
							"value": 0.5,
							"range": [0.001, 1]
						},
						"release": {
							"value": 0.1,
							"range": [0, 2]
						}
					}
				},
				"filter": {
					"cutoff": {
						"value": 4800,
						"range": [0, 8000]
					},
					"emphasis": {
						"value": 2,
						"range": [0.4, 40]
					},
					"envAmount": {
						"value": 0,
						"range": [0, 1]
					}
				},
				"lfo": {
					"waveform": {
						"value": 0,
						"range": [0, 5]
					},
					"rate": {
						"value": 1,
						"range": [1, 25]
					},
					"amount": {
						"value": 0,
						"range": [0, 1]
					}
				},
				"pitch": {
					"bend": {
						"value": 0,
						"range": [-200, 200]
					}
				}
			}
		}
	},
	"Turbo Saw Lead": {
		"version": 5,
		"daw": {
			"pitch": {
				"bend": 0
			},
			"modulation": {
				"rate": 0
			},
			"delay": {
				"time": 450,
				"feedback": 0.54,
				"dry": 1,
				"wet": 0.46
			},
			"reverb": {
				"level": 0
			},
			"masterVolume": {
				"level": 1
			}
		},
		"instruments": {
			"synth": {
				"polyphony": {
					"voiceCount": 1,
					"sustain": 0
				},
				"modulation": {
					"waveform": 0,
					"portamento": 0.003333333333333333,
					"rate": 0
				},
				"oscillator": {
					"osc1": {
						"range": 0,
						"fineDetune": 0,
						"waveform": 2
					},
					"osc2": {
						"range": 0,
						"fineDetune": -1.5009380863040178,
						"waveform": 2
					},
					"osc3": {
						"range": 0,
						"fineDetune": -26.516572858036284,
						"waveform": 2
					}
				},
				"mixer": {
					"volume1": {
						"enabled": 1,
						"level": 0.48
					},
					"volume2": {
						"enabled": 1,
						"level": 0.48
					},
					"volume3": {
						"enabled": 1,
						"level": 0.42
					}
				},
				"noise": {
					"enabled": 0,
					"type": 0,
					"level": 0.2
				},
				"envelopes": {
					"primary": {
						"attack": 0.02,
						"decay": 1.36064,
						"sustain": 0.57,
						"release": 0.16
					},
					"filter": {
						"attack": 0.5,
						"decay": 0.5,
						"sustain": 0.5,
						"release": 0.1
					}
				},
				"filter": {
					"cutoff": 8000,
					"emphasis": 2,
					"envAmount": 0
				},
				"lfo": {
					"waveform": 0,
					"rate": 1,
					"amount": 0.39
				},
				"pitch": {
					"bend": 0
				}
			}
		}
	},
	"BRAINPAIN Mod Wheel Frenzy": {
		"version": 5,
		"daw": {
			"pitch": {
				"bend": 0
			},
			"modulation": {
				"rate": 0
			},
			"delay": {
				"time": 570,
				"feedback": 0.45,
				"dry": 1,
				"wet": 0
			},
			"reverb": {
				"level": 0
			},
			"masterVolume": {
				"level": 1
			}
		},
		"instruments": {
			"synth": {
				"polyphony": {
					"voiceCount": 3,
					"sustain": 0
				},
				"modulation": {
					"waveform": 0,
					"portamento": 0.039999999999999994,
					"rate": 0
				},
				"oscillator": {
					"osc1": {
						"range": -3,
						"fineDetune": 0,
						"waveform": 0
					},
					"osc2": {
						"range": -2,
						"fineDetune": -0.5003126954346726,
						"waveform": 2
					},
					"osc3": {
						"range": -1,
						"fineDetune": 698.9368355222014,
						"waveform": 2
					}
				},
				"mixer": {
					"volume1": {
						"enabled": 1,
						"level": 0.83
					},
					"volume2": {
						"enabled": 1,
						"level": 0.49
					},
					"volume3": {
						"enabled": 1,
						"level": 0.31
					}
				},
				"noise": {
					"enabled": 0,
					"level": 0.65,
					"type": 0
				},
				"envelopes": {
					"primary": {
						"attack": 0,
						"decay": 0.002,
						"sustain": 1,
						"release": 0.06
					},
					"filter": {
						"attack": 0.52,
						"decay": 2,
						"sustain": 0.7902100000000001,
						"release": 0.06
					}
				},
				"filter": {
					"cutoff": 2224,
					"emphasis": 0.4,
					"envAmount": 0.4
				},
				"lfo": {
					"waveform": 0,
					"rate": 1,
					"amount": 0.46
				},
				"pitch": {
					"bend": 0
				}
			}
		}
	},
	"Pumped Bass": {
		"version": 6,
		"daw": {
			"pitch": {
				"bend": 0
			},
			"modulation": {
				"rate": 0
			},
			"compressor": {
				"enabled": 1,
				"threshold": -35.5,
				"ratio": 2.7999999999999994,
				"knee": 6,
				"attack": 0.01,
				"release": 0.1,
				"makeupGain": 5.800000000000001
			},
			"delay": {
				"time": 110,
				"feedback": 0.061875000000000006,
				"dry": 1,
				"wet": 0
			},
			"reverb": {
				"level": 0.38
			},
			"masterVolume": {
				"level": 1
			}
		},
		"instruments": {
			"synth": {
				"polyphony": {
					"voiceCount": 1,
					"sustain": 0
				},
				"modulation": {
					"waveform": 0,
					"portamento": 0,
					"rate": 0
				},
				"oscillator": {
					"osc1": {
						"range": -3,
						"fineDetune": 0,
						"waveform": 2
					},
					"osc2": {
						"range": -3,
						"fineDetune": -11.507191994996901,
						"waveform": 2
					},
					"osc3": {
						"range": -3,
						"fineDetune": 10.506566604127556,
						"waveform": 2
					}
				},
				"mixer": {
					"volume1": {
						"enabled": 1,
						"level": 1
					},
					"volume2": {
						"enabled": 1,
						"level": 0.97
					},
					"volume3": {
						"enabled": 1,
						"level": 0.45
					}
				},
				"noise": {
					"enabled": 0,
					"level": 0.38,
					"type": 0
				},
				"envelopes": {
					"primary": {
						"attack": 0,
						"decay": 0.002,
						"sustain": 1,
						"release": 0.92
					},
					"filter": {
						"attack": 0.88,
						"decay": 1.82,
						"sustain": 0.06094,
						"release": 0.8
					}
				},
				"filter": {
					"cutoff": 4960,
					"emphasis": 14,
					"envAmount": 1
				},
				"lfo": {
					"waveform": 0,
					"rate": 9,
					"amount": 0
				},
				"pitch": {
					"bend": 0
				}
			}
		}
	},
	"Cooh bass 1": {
		"version": 5,
		"daw": {
			"pitch": {
				"bend": 0
			},
			"modulation": {
				"rate": 0
			},
			"delay": {
				"time": 370,
				"feedback": 0.5670000000000001,
				"dry": 0.75,
				"wet": 0
			},
			"reverb": {
				"level": 0.35
			},
			"masterVolume": {
				"level": 0.51
			}
		},
		"instruments": {
			"synth": {
				"polyphony": {
					"voiceCount": 1,
					"sustain": 0
				},
				"modulation": {
					"waveform": 0,
					"portamento": 0.08499999999999999,
					"rate": 0
				},
				"oscillator": {
					"osc1": {
						"range": -2,
						"fineDetune": 0,
						"waveform": 0
					},
					"osc2": {
						"range": -3,
						"fineDetune": -88.5553470919325,
						"waveform": 1
					},
					"osc3": {
						"range": -2,
						"fineDetune": -100.56285178236396,
						"waveform": 1
					}
				},
				"mixer": {
					"volume1": {
						"enabled": 1,
						"level": 0.65
					},
					"volume2": {
						"enabled": 1,
						"level": 0.85
					},
					"volume3": {
						"enabled": 1,
						"level": 0.22
					}
				},
				"noise": {
					"enabled": 1,
					"level": 0.13,
					"type": 2
				},
				"envelopes": {
					"primary": {
						"attack": 0,
						"decay": 0.002,
						"sustain": 1,
						"release": 0.72
					},
					"filter": {
						"attack": 0,
						"decay": 1.04,
						"sustain": 0.25075,
						"release": 0.1
					}
				},
				"filter": {
					"cutoff": 6560,
					"emphasis": 4,
					"envAmount": 1
				},
				"lfo": {
					"waveform": 4,
					"rate": 4,
					"amount": 0.86
				},
				"pitch": {
					"bend": 0
				}
			}
		}
	},
	"Timmo^Bass01": {
		"version": 6,
		"daw": {
			"pitch": {
				"bend": 0
			},
			"modulation": {
				"rate": 0
			},
			"compressor": {
				"threshold": -20,
				"ratio": 3,
				"knee": 2,
				"attack": 0.1,
				"release": 20,
				"makeupGain": 0,
				"enabled": 0
			},
			"delay": {
				"time": 850,
				"feedback": 0.54,
				"dry": 1,
				"wet": 0.06
			},
			"reverb": {
				"level": 0
			},
			"masterVolume": {
				"level": 0.56
			}
		},
		"instruments": {
			"synth": {
				"polyphony": {
					"voiceCount": 1,
					"sustain": 0
				},
				"modulation": {
					"waveform": 5,
					"portamento": 0,
					"rate": 0
				},
				"oscillator": {
					"osc1": {
						"range": -1,
						"fineDetune": 0,
						"waveform": 2
					},
					"osc2": {
						"range": -3,
						"fineDetune": 800,
						"waveform": 2
					},
					"osc3": {
						"range": -3,
						"fineDetune": 800,
						"waveform": 3
					}
				},
				"mixer": {
					"volume1": {
						"enabled": 1,
						"level": 0.68
					},
					"volume2": {
						"enabled": 1,
						"level": 1
					},
					"volume3": {
						"enabled": 1,
						"level": 1
					}
				},
				"noise": {
					"enabled": 1,
					"level": 0.27,
					"type": 1
				},
				"envelopes": {
					"primary": {
						"attack": 0,
						"decay": 0.002,
						"sustain": 1,
						"release": 0.78
					},
					"filter": {
						"attack": 0,
						"decay": 0,
						"sustain": 0.06094,
						"release": 2
					}
				},
				"filter": {
					"cutoff": 8000,
					"emphasis": 6,
					"envAmount": 0
				},
				"lfo": {
					"waveform": 4,
					"rate": 10,
					"amount": 0.19
				},
				"pitch": {
					"bend": 0
				}
			}
		}
	},
	"Soft Bass": {
		"version": 5,
		"daw": {
			"pitch": {
				"bend": 0
			},
			"modulation": {
				"rate": 0
			},
			"delay": {
				"time": 450,
				"feedback": 0.54,
				"dry": 1,
				"wet": 0
			},
			"reverb": {
				"level": 0
			},
			"masterVolume": {
				"level": 1
			}
		},
		"instruments": {
			"synth": {
				"polyphony": {
					"voiceCount": 1,
					"sustain": 0
				},
				"modulation": {
					"waveform": 0,
					"portamento": 0,
					"rate": 0
				},
				"oscillator": {
					"osc1": {
						"range": -3,
						"fineDetune": 0,
						"waveform": 3
					},
					"osc2": {
						"range": -2,
						"fineDetune": -1.5009380863040178,
						"waveform": 2
					},
					"osc3": {
						"range": 1,
						"fineDetune": -26.516572858036284,
						"waveform": 5
					}
				},
				"mixer": {
					"volume1": {
						"enabled": 1,
						"level": 0.33
					},
					"volume2": {
						"enabled": 0,
						"level": 0.27
					},
					"volume3": {
						"enabled": 0,
						"level": 0.33
					}
				},
				"noise": {
					"enabled": 0,
					"type": 0,
					"level": 0.2
				},
				"envelopes": {
					"primary": {
						"attack": 0,
						"decay": 0.002,
						"sustain": 1,
						"release": 1.28
					},
					"filter": {
						"attack": 0,
						"decay": 0.02,
						"sustain": 0.03097,
						"release": 1.46
					}
				},
				"filter": {
					"cutoff": 3040,
					"emphasis": 4.4,
					"envAmount": 1
				},
				"lfo": {
					"waveform": 3,
					"rate": 1,
					"amount": 0
				},
				"pitch": {
					"bend": 0
				}
			}
		}
	},
	"8 mile Free World Car Bass": {
		"version": 5,
		"daw": {
			"pitch": {
				"bend": 0
			},
			"modulation": {
				"rate": 0
			},
			"delay": {
				"time": 450,
				"feedback": 0.54,
				"dry": 1,
				"wet": 0
			},
			"reverb": {
				"level": 0
			},
			"masterVolume": {
				"level": 1
			}
		},
		"instruments": {
			"synth": {
				"polyphony": {
					"voiceCount": 1,
					"sustain": 0
				},
				"modulation": {
					"waveform": 0,
					"portamento": 0,
					"rate": 0
				},
				"oscillator": {
					"osc1": {
						"range": -3,
						"fineDetune": 0,
						"waveform": 3
					},
					"osc2": {
						"range": -2,
						"fineDetune": -1.5009380863040178,
						"waveform": 2
					},
					"osc3": {
						"range": 1,
						"fineDetune": -26.516572858036284,
						"waveform": 5
					}
				},
				"mixer": {
					"volume1": {
						"enabled": 1,
						"level": 0.33
					},
					"volume2": {
						"enabled": 1,
						"level": 0.27
					},
					"volume3": {
						"enabled": 0,
						"level": 0.33
					}
				},
				"noise": {
					"enabled": 0,
					"type": 0,
					"level": 0.2
				},
				"envelopes": {
					"primary": {
						"attack": 0,
						"decay": 0.002,
						"sustain": 1,
						"release": 0
					},
					"filter": {
						"attack": 0,
						"decay": 0.02,
						"sustain": 0.03097,
						"release": 0.42
					}
				},
				"filter": {
					"cutoff": 3040,
					"emphasis": 4.4,
					"envAmount": 1
				},
				"lfo": {
					"waveform": 3,
					"rate": 1,
					"amount": 0
				},
				"pitch": {
					"bend": 0
				}
			}
		}
	},
	"Muffled Razr Bass": {
		"version": 6,
		"daw": {
			"pitch": {
				"bend": 0
			},
			"modulation": {
				"rate": 0
			},
			"compressor": {
				"enabled": 1,
				"threshold": -20,
				"ratio": 3,
				"knee": 2,
				"attack": 0.1,
				"release": 20,
				"makeupGain": 2.8000000000000003
			},
			"delay": {
				"time": 570,
				"feedback": 0.45,
				"dry": 1,
				"wet": 0
			},
			"reverb": {
				"level": 0
			},
			"masterVolume": {
				"level": 0.9
			}
		},
		"instruments": {
			"synth": {
				"polyphony": {
					"voiceCount": 1,
					"sustain": 0
				},
				"modulation": {
					"waveform": 0,
					"portamento": 0.006666666666666666,
					"rate": 0
				},
				"oscillator": {
					"osc1": {
						"range": -1,
						"fineDetune": 0,
						"waveform": 2
					},
					"osc2": {
						"range": -2,
						"fineDetune": 0,
						"waveform": 2
					},
					"osc3": {
						"range": -3,
						"fineDetune": 0,
						"waveform": 3
					}
				},
				"mixer": {
					"volume1": {
						"enabled": 0,
						"level": 0.2
					},
					"volume2": {
						"enabled": 1,
						"level": 0.16
					},
					"volume3": {
						"enabled": 1,
						"level": 0.08
					}
				},
				"noise": {
					"enabled": 0,
					"level": 0.17,
					"type": 0
				},
				"envelopes": {
					"primary": {
						"attack": 0,
						"decay": 0.002,
						"sustain": 1,
						"release": 0.02
					},
					"filter": {
						"attack": 2,
						"decay": 1.44,
						"sustain": 0.001,
						"release": 0.02
					}
				},
				"filter": {
					"cutoff": 166,
					"emphasis": 1.6,
					"envAmount": 0.36
				},
				"lfo": {
					"waveform": 0,
					"rate": 6,
					"amount": 0
				},
				"pitch": {
					"bend": 0
				}
			}
		}
	},
	"Da Buzzer": {
		"version": 6,
		"daw": {
			"pitch": {
				"bend": 0
			},
			"modulation": {
				"rate": 0
			},
			"compressor": {
				"enabled": 1,
				"threshold": -20,
				"ratio": 3,
				"knee": 2,
				"attack": 0.1,
				"release": 20,
				"makeupGain": 1.6
			},
			"delay": {
				"time": 570,
				"feedback": 0.63,
				"dry": 1,
				"wet": 0.41
			},
			"reverb": {
				"level": 0.36
			},
			"masterVolume": {
				"level": 0.9
			}
		},
		"instruments": {
			"synth": {
				"polyphony": {
					"voiceCount": 1,
					"sustain": 0
				},
				"modulation": {
					"waveform": 0,
					"portamento": 0.006666666666666666,
					"rate": 0
				},
				"oscillator": {
					"osc1": {
						"range": -1,
						"fineDetune": 0,
						"waveform": 2
					},
					"osc2": {
						"range": -2,
						"fineDetune": 0,
						"waveform": 2
					},
					"osc3": {
						"range": -3,
						"fineDetune": 0,
						"waveform": 3
					}
				},
				"mixer": {
					"volume1": {
						"enabled": 0,
						"level": 0.2
					},
					"volume2": {
						"enabled": 1,
						"level": 0.16
					},
					"volume3": {
						"enabled": 1,
						"level": 0.08
					}
				},
				"noise": {
					"enabled": 0,
					"level": 0.17,
					"type": 0
				},
				"envelopes": {
					"primary": {
						"attack": 0,
						"decay": 0.002,
						"sustain": 1,
						"release": 0.02
					},
					"filter": {
						"attack": 2,
						"decay": 1.44,
						"sustain": 0.001,
						"release": 0.02
					}
				},
				"filter": {
					"cutoff": 5360,
					"emphasis": 1.6,
					"envAmount": 0.36
				},
				"lfo": {
					"waveform": 0,
					"rate": 6,
					"amount": 0
				},
				"pitch": {
					"bend": 0
				}
			}
		}
	},
	"Glass Bell Bass": {
		"version": 5,
		"daw": {
			"pitch": {
				"bend": 0
			},
			"modulation": {
				"rate": 0
			},
			"delay": {
				"time": 450,
				"feedback": 0.387,
				"dry": 0.66,
				"wet": 0.44
			},
			"reverb": {
				"level": 0.17
			},
			"masterVolume": {
				"level": 0.5
			}
		},
		"instruments": {
			"synth": {
				"polyphony": {
					"voiceCount": 10,
					"sustain": 0
				},
				"modulation": {
					"waveform": 0,
					"portamento": 0,
					"rate": 0
				},
				"oscillator": {
					"osc1": {
						"range": -1,
						"fineDetune": 0,
						"waveform": 2
					},
					"osc2": {
						"range": 1,
						"fineDetune": -11.504690431519748,
						"waveform": 0
					},
					"osc3": {
						"range": -2,
						"fineDetune": 9.999999999999773,
						"waveform": 0
					}
				},
				"mixer": {
					"volume1": {
						"enabled": 0,
						"level": 0.7
					},
					"volume2": {
						"enabled": 1,
						"level": 1
					},
					"volume3": {
						"enabled": 1,
						"level": 1
					}
				},
				"noise": {
					"enabled": 0,
					"level": 0.15,
					"type": 2
				},
				"envelopes": {
					"primary": {
						"attack": 0,
						"decay": 0.002,
						"sustain": 0.23,
						"release": 0.08
					},
					"filter": {
						"attack": 0,
						"decay": 0.04,
						"sustain": 0.56044,
						"release": 0.92
					}
				},
				"filter": {
					"cutoff": 8000,
					"emphasis": 0.4,
					"envAmount": 0
				},
				"lfo": {
					"waveform": 0,
					"rate": 3,
					"amount": 0
				},
				"pitch": {
					"bend": 0
				}
			}
		}
	},
	"Bass Razr Lead": {
		"daw": {
			"pitch": {
				"bend": {
					"value": 0,
					"range": [-200, 200]
				}
			},
			"modulation": {
				"rate": {
					"value": 0,
					"range": [0, 15]
				}
			},
			"delay": {
				"time": {
					"value": 570,
					"range": [0, 1000]
				},
				"feedback": {
					"value": 0.45,
					"range": [0, 0.9]
				},
				"dry": {
					"value": 1,
					"range": [0, 1]
				},
				"wet": {
					"value": 0,
					"range": [0, 1]
				}
			},
			"reverb": {
				"level": {
					"value": 0.36,
					"range": [0, 1]
				}
			},
			"masterVolume": {
				"level": {
					"value": 0.8,
					"range": [0, 1]
				}
			}
		},
		"instruments": {
			"synth": {
				"modulation": {
					"waveform": {
						"value": 0,
						"range": [0, 5]
					},
					"portamento": {
						"value": 0.006666666666666666,
						"range": [0, 0.16666666666666666]
					},
					"rate": {
						"value": 0,
						"range": [0, 15]
					}
				},
				"oscillator": {
					"osc1": {
						"range": {
							"value": -1,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 2,
							"range": [0, 5]
						}
					},
					"osc2": {
						"range": {
							"value": -2,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 2,
							"range": [0, 5]
						}
					},
					"osc3": {
						"range": {
							"value": -3,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 3,
							"range": [0, 5]
						}
					}
				},
				"mixer": {
					"volume1": {
						"enabled": {
							"value": 0,
							"range": [0, 1]
						},
						"level": {
							"value": 0.2,
							"range": [0, 1]
						}
					},
					"volume2": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.16,
							"range": [0, 1]
						}
					},
					"volume3": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.08,
							"range": [0, 1]
						}
					}
				},
				"noise": {
					"enabled": {
						"value": 0,
						"range": [0, 1]
					},
					"level": {
						"value": 0.17,
						"range": [0, 1]
					},
					"type": {
						"value": 0,
						"range": [0, 2]
					}
				},
				"envelopes": {
					"primary": {
						"attack": {
							"value": 0,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.002,
							"range": [0.002, 2]
						},
						"sustain": {
							"value": 1,
							"range": [0, 1]
						},
						"release": {
							"value": 0.02,
							"range": [0, 2]
						}
					},
					"filter": {
						"attack": {
							"value": 2,
							"range": [0, 2]
						},
						"decay": {
							"value": 1.44,
							"range": [0, 2]
						},
						"sustain": {
							"value": 0.001,
							"range": [0.001, 1]
						},
						"release": {
							"value": 0.02,
							"range": [0, 2]
						}
					}
				},
				"filter": {
					"cutoff": {
						"value": 2048,
						"range": [0, 8000]
					},
					"emphasis": {
						"value": 1.6,
						"range": [0.4, 40]
					},
					"envAmount": {
						"value": 0.36,
						"range": [0, 1]
					}
				},
				"lfo": {
					"waveform": {
						"value": 0,
						"range": [0, 5]
					},
					"rate": {
						"value": 6,
						"range": [1, 25]
					},
					"amount": {
						"value": 0,
						"range": [0, 1]
					}
				},
				"pitch": {
					"bend": {
						"value": 0,
						"range": [-200, 200]
					}
				}
			}
		}
	},
	"Sine Bass": {
		"daw": {
			"pitch": {
				"bend": {
					"value": 0,
					"range": [-200, 200]
				}
			},
			"modulation": {
				"rate": {
					"value": 0,
					"range": [0, 15]
				}
			},
			"delay": {
				"time": {
					"value": 570,
					"range": [0, 1000]
				},
				"feedback": {
					"value": 0.45,
					"range": [0, 0.9]
				},
				"dry": {
					"value": 1,
					"range": [0, 1]
				},
				"wet": {
					"value": 0,
					"range": [0, 1]
				}
			},
			"reverb": {
				"level": {
					"value": 0.15,
					"range": [0, 1]
				}
			},
			"masterVolume": {
				"level": {
					"value": 0.8,
					"range": [0, 1]
				}
			}
		},
		"instruments": {
			"synth": {
				"modulation": {
					"waveform": {
						"value": 0,
						"range": [0, 5]
					},
					"portamento": {
						"value": 0.006666666666666666,
						"range": [0, 0.16666666666666666]
					},
					"rate": {
						"value": 0,
						"range": [0, 15]
					}
				},
				"oscillator": {
					"osc1": {
						"range": {
							"value": -1,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 0,
							"range": [0, 5]
						}
					},
					"osc2": {
						"range": {
							"value": -2,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 0,
							"range": [0, 5]
						}
					},
					"osc3": {
						"range": {
							"value": -3,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 0,
							"range": [0, 5]
						}
					}
				},
				"mixer": {
					"volume1": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.2,
							"range": [0, 1]
						}
					},
					"volume2": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.25,
							"range": [0, 1]
						}
					},
					"volume3": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.55,
							"range": [0, 1]
						}
					}
				},
				"noise": {
					"enabled": {
						"value": 0,
						"range": [0, 1]
					},
					"level": {
						"value": 0.17,
						"range": [0, 1]
					},
					"type": {
						"value": 0,
						"range": [0, 2]
					}
				},
				"envelopes": {
					"primary": {
						"attack": {
							"value": 0,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.002,
							"range": [0.002, 2]
						},
						"sustain": {
							"value": 0.73,
							"range": [0, 1]
						},
						"release": {
							"value": 0.02,
							"range": [0, 2]
						}
					},
					"filter": {
						"attack": {
							"value": 0.14,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.2,
							"range": [0, 2]
						},
						"sustain": {
							"value": 0.16084,
							"range": [0.001, 1]
						},
						"release": {
							"value": 0.48,
							"range": [0, 2]
						}
					}
				},
				"filter": {
					"cutoff": {
						"value": 560,
						"range": [0, 8000]
					},
					"emphasis": {
						"value": 8.4,
						"range": [0.4, 40]
					},
					"envAmount": {
						"value": 0,
						"range": [0, 1]
					}
				},
				"lfo": {
					"waveform": {
						"value": 0,
						"range": [0, 5]
					},
					"rate": {
						"value": 6,
						"range": [1, 25]
					},
					"amount": {
						"value": 0,
						"range": [0, 1]
					}
				},
				"pitch": {
					"bend": {
						"value": 0,
						"range": [-200, 200]
					}
				}
			}
		}
	},
	"Deep Sine Bass": {
		"daw": {
			"pitch": {
				"bend": {
					"value": 0,
					"range": [-200, 200]
				}
			},
			"modulation": {
				"rate": {
					"value": 0,
					"range": [0, 15]
				}
			},
			"delay": {
				"time": {
					"value": 570,
					"range": [0, 1000]
				},
				"feedback": {
					"value": 0.45,
					"range": [0, 0.9]
				},
				"dry": {
					"value": 1,
					"range": [0, 1]
				},
				"wet": {
					"value": 0,
					"range": [0, 1]
				}
			},
			"reverb": {
				"level": {
					"value": 0.15,
					"range": [0, 1]
				}
			},
			"masterVolume": {
				"level": {
					"value": 1,
					"range": [0, 1]
				}
			}
		},
		"instruments": {
			"synth": {
				"modulation": {
					"waveform": {
						"value": 0,
						"range": [0, 5]
					},
					"portamento": {
						"value": 0.0016666666666666666,
						"range": [0, 0.16666666666666666]
					},
					"rate": {
						"value": 0,
						"range": [0, 15]
					}
				},
				"oscillator": {
					"osc1": {
						"range": {
							"value": -2,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 0,
							"range": [0, 5]
						}
					},
					"osc2": {
						"range": {
							"value": -3,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 0,
							"range": [0, 5]
						}
					},
					"osc3": {
						"range": {
							"value": -4,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 0,
							"range": [0, 5]
						}
					}
				},
				"mixer": {
					"volume1": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.11,
							"range": [0, 1]
						}
					},
					"volume2": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.1,
							"range": [0, 1]
						}
					},
					"volume3": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.51,
							"range": [0, 1]
						}
					}
				},
				"noise": {
					"enabled": {
						"value": 0,
						"range": [0, 1]
					},
					"level": {
						"value": 0.17,
						"range": [0, 1]
					},
					"type": {
						"value": 0,
						"range": [0, 2]
					}
				},
				"envelopes": {
					"primary": {
						"attack": {
							"value": 0,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.002,
							"range": [0.002, 2]
						},
						"sustain": {
							"value": 0.73,
							"range": [0, 1]
						},
						"release": {
							"value": 0.02,
							"range": [0, 2]
						}
					},
					"filter": {
						"attack": {
							"value": 0.14,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.2,
							"range": [0, 2]
						},
						"sustain": {
							"value": 0.16084,
							"range": [0.001, 1]
						},
						"release": {
							"value": 0.48,
							"range": [0, 2]
						}
					}
				},
				"filter": {
					"cutoff": {
						"value": 560,
						"range": [0, 8000]
					},
					"emphasis": {
						"value": 13.200000000000001,
						"range": [0.4, 40]
					},
					"envAmount": {
						"value": 0,
						"range": [0, 1]
					}
				},
				"lfo": {
					"waveform": {
						"value": 0,
						"range": [0, 5]
					},
					"rate": {
						"value": 6,
						"range": [1, 25]
					},
					"amount": {
						"value": 0,
						"range": [0, 1]
					}
				},
				"pitch": {
					"bend": {
						"value": 0,
						"range": [-200, 200]
					}
				}
			}
		}
	},
	"Freqax Bass": {
		"version": 6,
		"daw": {
			"pitch": {
				"bend": 0
			},
			"modulation": {
				"rate": 0.234375
			},
			"compressor": {
				"enabled": 1,
				"threshold": -11.5,
				"ratio": 3.9000000000000004,
				"knee": 0.9,
				"attack": 0.01,
				"release": 31.1,
				"makeupGain": 2.8000000000000003
			},
			"delay": {
				"time": 460,
				"feedback": 0.47700000000000004,
				"dry": 1,
				"wet": 0
			},
			"reverb": {
				"level": 0
			},
			"masterVolume": {
				"level": 0.85
			}
		},
		"instruments": {
			"synth": {
				"polyphony": {
					"voiceCount": 1,
					"sustain": 0
				},
				"modulation": {
					"waveform": 0,
					"portamento": 0,
					"rate": 0.234375
				},
				"oscillator": {
					"osc1": {
						"range": -2,
						"fineDetune": 0,
						"waveform": 2
					},
					"osc2": {
						"range": -1,
						"fineDetune": 800,
						"waveform": 2
					},
					"osc3": {
						"range": -3,
						"fineDetune": -87.55472170106316,
						"waveform": 2
					}
				},
				"mixer": {
					"volume1": {
						"enabled": 1,
						"level": 0.08
					},
					"volume2": {
						"enabled": 1,
						"level": 0.13
					},
					"volume3": {
						"enabled": 1,
						"level": 1
					}
				},
				"noise": {
					"enabled": 1,
					"level": 0,
					"type": 0
				},
				"envelopes": {
					"primary": {
						"attack": 0.16,
						"decay": 0.002,
						"sustain": 1,
						"release": 0
					},
					"filter": {
						"attack": 0.14,
						"decay": 0.2,
						"sustain": 0.16084,
						"release": 0.48
					}
				},
				"filter": {
					"cutoff": 5104,
					"emphasis": 20.400000000000002,
					"envAmount": 0.54
				},
				"lfo": {
					"waveform": 3,
					"rate": 2,
					"amount": 1
				},
				"pitch": {
					"bend": 0
				}
			}
		}
	},
	"Niada's Sap Bass": {
		"version": 4,
		"daw": {
			"pitch": {
				"bend": 0
			},
			"modulation": {
				"rate": 0
			},
			"delay": {
				"time": 0,
				"feedback": 0.621,
				"dry": 0.31,
				"wet": 1
			},
			"reverb": {
				"level": 0.03
			},
			"masterVolume": {
				"level": 0.5
			}
		},
		"instruments": {
			"synth": {
				"polyphony": {
					"voiceCount": 1,
					"sustain": 0
				},
				"modulation": {
					"waveform": 0,
					"portamento": 0.016666666666666666,
					"rate": 0
				},
				"oscillator": {
					"osc1": {
						"range": -3,
						"fineDetune": 0,
						"waveform": 0
					},
					"osc2": {
						"range": -2,
						"fineDetune": -8,
						"waveform": 2
					},
					"osc3": {
						"range": -1,
						"fineDetune": -8,
						"waveform": 3
					}
				},
				"mixer": {
					"volume1": {
						"enabled": 1,
						"level": 1
					},
					"volume2": {
						"enabled": 1,
						"level": 1
					},
					"volume3": {
						"enabled": 1,
						"level": 1
					}
				},
				"noise": {
					"enabled": 1,
					"level": 0.05,
					"type": 1
				},
				"envelopes": {
					"primary": {
						"attack": 0.02,
						"decay": 0.26174000000000003,
						"sustain": 0.77,
						"release": 0.1
					},
					"filter": {
						"attack": 0.02,
						"decay": 0.14,
						"sustain": 0.001,
						"release": 0.1
					}
				},
				"filter": {
					"cutoff": 0,
					"emphasis": 4.4,
					"envAmount": 1
				},
				"lfo": {
					"waveform": 0,
					"rate": 1,
					"amount": 0
				},
				"pitch": {
					"bend": 0
				}
			}
		}
	},
	"Eclectic Method Bass": {
		"version": 4,
		"daw": {
			"pitch": {
				"bend": 0
			},
			"modulation": {
				"rate": 0
			},
			"delay": {
				"time": 500,
				"feedback": 0.54,
				"dry": 1,
				"wet": 0
			},
			"reverb": {
				"level": 0.05
			},
			"masterVolume": {
				"level": 0.8
			}
		},
		"instruments": {
			"synth": {
				"polyphony": {
					"voiceCount": 1,
					"sustain": 0
				},
				"modulation": {
					"waveform": 0,
					"portamento": 0.051666666666666666,
					"rate": 0
				},
				"oscillator": {
					"osc1": {
						"range": -2,
						"fineDetune": 0,
						"waveform": 2
					},
					"osc2": {
						"range": -2,
						"fineDetune": -1,
						"waveform": 2
					},
					"osc3": {
						"range": -1,
						"fineDetune": -8,
						"waveform": 2
					}
				},
				"mixer": {
					"volume1": {
						"enabled": 1,
						"level": 1
					},
					"volume2": {
						"enabled": 1,
						"level": 0.16
					},
					"volume3": {
						"enabled": 0,
						"level": 0.18
					}
				},
				"noise": {
					"enabled": 0,
					"level": 0,
					"type": 0
				},
				"envelopes": {
					"primary": {
						"attack": 0.44,
						"decay": 0.02198,
						"sustain": 0.87,
						"release": 0
					},
					"filter": {
						"attack": 2,
						"decay": 0,
						"sustain": 0.001,
						"release": 0
					}
				},
				"filter": {
					"cutoff": 2528,
					"emphasis": 15.6,
					"envAmount": 0
				},
				"lfo": {
					"waveform": 0,
					"rate": 4,
					"amount": 0
				},
				"pitch": {
					"bend": 0
				}
			}
		}
	},

	"singende Säge Lead": {
		"version": 5,
		"daw": {
			"pitch": {
				"bend": 0
			},
			"modulation": {
				"rate": 10.6640625
			},
			"delay": {
				"time": 450,
				"feedback": 0.54,
				"dry": 0.35,
				"wet": 0.31
			},
			"reverb": {
				"level": 0.66
			},
			"masterVolume": {
				"level": 0.56
			}
		},
		"instruments": {
			"synth": {
				"polyphony": {
					"voiceCount": 1,
					"sustain": 0
				},
				"modulation": {
					"waveform": 0,
					"portamento": 0,
					"rate": 10.6640625
				},
				"oscillator": {
					"osc1": {
						"range": -3,
						"fineDetune": 0,
						"waveform": 2
					},
					"osc2": {
						"range": 0,
						"fineDetune": -1.5009380863040178,
						"waveform": 2
					},
					"osc3": {
						"range": 2,
						"fineDetune": -2.5015634771732493,
						"waveform": 2
					}
				},
				"mixer": {
					"volume1": {
						"enabled": 0,
						"level": 0.69
					},
					"volume2": {
						"enabled": 0,
						"level": 0.86
					},
					"volume3": {
						"enabled": 1,
						"level": 0.35
					}
				},
				"noise": {
					"enabled": 0,
					"level": 0.59,
					"type": 0
				},
				"envelopes": {
					"primary": {
						"attack": 0,
						"decay": 0.02198,
						"sustain": 0.57,
						"release": 0
					},
					"filter": {
						"attack": 1.72,
						"decay": 0.02,
						"sustain": 0.86014,
						"release": 0.1
					}
				},
				"filter": {
					"cutoff": 4800,
					"emphasis": 2.8000000000000003,
					"envAmount": 0.7
				},
				"lfo": {
					"waveform": 0,
					"rate": 1,
					"amount": 0
				},
				"pitch": {
					"bend": 0
				}
			}
		}
	},


	"EQUIVALENT-BASS-1": {
		"version": 5,
		"daw": {
			"pitch": {
				"bend": 0
			},
			"modulation": {
				"rate": 15
			},
			"delay": {
				"time": 480,
				"feedback": 0.45,
				"dry": 1,
				"wet": 0
			},
			"reverb": {
				"level": 0.21
			},
			"masterVolume": {
				"level": 0.31
			}
		},
		"instruments": {
			"synth": {
				"polyphony": {
					"voiceCount": 1,
					"sustain": 0
				},
				"modulation": {
					"waveform": 5,
					"portamento": 0.05333333333333333,
					"rate": 15
				},
				"oscillator": {
					"osc1": {
						"range": -3,
						"fineDetune": 0,
						"waveform": 1
					},
					"osc2": {
						"range": -3,
						"fineDetune": -0.5003126954346726,
						"waveform": 1
					},
					"osc3": {
						"range": -3,
						"fineDetune": 36.52282676672928,
						"waveform": 1
					}
				},
				"mixer": {
					"volume1": {
						"enabled": 1,
						"level": 1
					},
					"volume2": {
						"enabled": 1,
						"level": 1
					},
					"volume3": {
						"enabled": 1,
						"level": 1
					}
				},
				"noise": {
					"enabled": 1,
					"level": 0.5,
					"type": 0
				},
				"envelopes": {
					"primary": {
						"attack": 0,
						"decay": 0.56144,
						"sustain": 1,
						"release": 1.34
					},
					"filter": {
						"attack": 1.6,
						"decay": 0.8,
						"sustain": 0.47052999999999995,
						"release": 0.2
					}
				},
				"filter": {
					"cutoff": 416,
					"emphasis": 6.800000000000001,
					"envAmount": 1
				},
				"lfo": {
					"waveform": 3,
					"rate": 1,
					"amount": 1
				},
				"pitch": {
					"bend": 0
				}
			}
		}
	},
    "EQUIVALENT-CHORD-PAD-1": {
        "version": 6,
        "daw": {
            "pitch": {
                "bend": 0
            },
            "modulation": {
                "rate": 1.7578125
            },
            "compressor": {
                "enabled": 1,
                "threshold": -15.5,
                "ratio": 4.300000000000001,
                "knee": 2.1,
                "attack": 0.01,
                "release": 402.1,
                "makeupGain": 0
            },
            "delay": {
                "time": 540,
                "feedback": 0.675,
                "dry": 1,
                "wet": 0.88
            },
            "reverb": {
                "level": 1
            },
            "masterVolume": {
                "level": 0.41
            }
        },
        "instruments": {
            "synth": {
                "polyphony": {
                    "voiceCount": 4,
                    "sustain": 0
                },
                "modulation": {
                    "waveform": 0,
                    "portamento": 0.13666666666666666,
                    "rate": 1.7578125
                },
                "oscillator": {
                    "osc1": {
                        "range": -1,
                        "fineDetune": 0,
                        "waveform": 2
                    },
                    "osc2": {
                        "range": -3,
                        "fineDetune": -23.514696685428362,
                        "waveform": 2
                    },
                    "osc3": {
                        "range": -1,
                        "fineDetune": -502.8142589118199,
                        "waveform": 2
                    }
                },
                "mixer": {
                    "volume1": {
                        "enabled": 1,
                        "level": 1
                    },
                    "volume2": {
                        "enabled": 1,
                        "level": 1
                    },
                    "volume3": {
                        "enabled": 1,
                        "level": 1
                    }
                },
                "noise": {
                    "enabled": 1,
                    "level": 0.51,
                    "type": 2
                },
                "envelopes": {
                    "primary": {
                        "attack": 2,
                        "decay": 1.8201800000000001,
                        "sustain": 0.85,
                        "release": 2
                    },
                    "filter": {
                        "attack": 2,
                        "decay": 2,
                        "sustain": 0.020980000000000002,
                        "release": 2
                    }
                },
                "filter": {
                    "cutoff": 1696,
                    "emphasis": 7.2,
                    "envAmount": 1
                },
                "lfo": {
                    "waveform": 4,
                    "rate": 2,
                    "amount": 0.17
                },
                "pitch": {
                    "bend": 0
                }
            }
        }
    },
    "EQUIVALENT-CHORD-PAD-2": {
        "version": 6,
        "daw": {
            "pitch": {
                "bend": 0
            },
            "modulation": {
                "rate": 0.703125
            },
            "compressor": {
                "enabled": 1,
                "threshold": -15.5,
                "ratio": 4.300000000000001,
                "knee": 10.1,
                "attack": 0.01,
                "release": 402.1,
                "makeupGain": 0
            },
            "delay": {
                "time": 420,
                "feedback": 0.675,
                "dry": 1,
                "wet": 0.88
            },
            "reverb": {
                "level": 1
            },
            "masterVolume": {
                "level": 0.37
            }
        },
        "instruments": {
            "synth": {
                "polyphony": {
                    "voiceCount": 4,
                    "sustain": 0
                },
                "modulation": {
                    "waveform": 3,
                    "portamento": 0.135,
                    "rate": 0.703125
                },
                "oscillator": {
                    "osc1": {
                        "range": -2,
                        "fineDetune": 0,
                        "waveform": 2
                    },
                    "osc2": {
                        "range": -3,
                        "fineDetune": -14.509068167604823,
                        "waveform": 3
                    },
                    "osc3": {
                        "range": 0,
                        "fineDetune": -482.801751094434,
                        "waveform": 0
                    }
                },
                "mixer": {
                    "volume1": {
                        "enabled": 1,
                        "level": 1
                    },
                    "volume2": {
                        "enabled": 1,
                        "level": 0.51
                    },
                    "volume3": {
                        "enabled": 1,
                        "level": 0.99
                    }
                },
                "noise": {
                    "enabled": 1,
                    "level": 0.14,
                    "type": 2
                },
                "envelopes": {
                    "primary": {
                        "attack": 2,
                        "decay": 1.8201800000000001,
                        "sustain": 0.85,
                        "release": 2
                    },
                    "filter": {
                        "attack": 2,
                        "decay": 2,
                        "sustain": 0.020980000000000002,
                        "release": 2
                    }
                },
                "filter": {
                    "cutoff": 4496,
                    "emphasis": 4.800000000000001,
                    "envAmount": 0
                },
                "lfo": {
                    "waveform": 4,
                    "rate": 2,
                    "amount": 0.17
                },
                "pitch": {
                    "bend": 0
                }
            }
        }
    },
    "Gryphon 1977": {
        "version": 6,
        "daw": {
            "pitch": {
                "bend": 0
            },
            "modulation": {
                "rate": 0
            },
            "compressor": {
                "enabled": 1,
                "threshold": -22.5,
                "ratio": 5.1000000000000005,
                "knee": 2,
                "attack": 0.1,
                "release": 20,
                "makeupGain": 2.1
            },
            "delay": {
                "time": 290,
                "feedback": 0.684,
                "dry": 0.57,
                "wet": 0.13
            },
            "reverb": {
                "level": 0.16
            },
            "masterVolume": {
                "level": 0.66
            }
        },
        "instruments": {
            "synth": {
                "polyphony": {
                    "voiceCount": 8,
                    "sustain": 0
                },
                "modulation": {
                    "waveform": 0,
                    "portamento": 0,
                    "rate": 0
                },
                "oscillator": {
                    "osc1": {
                        "range": -2,
                        "fineDetune": 0,
                        "waveform": 5
                    },
                    "osc2": {
                        "range": -1,
                        "fineDetune": 20.51282051282044,
                        "waveform": 2
                    },
                    "osc3": {
                        "range": -1,
                        "fineDetune": 17.51094434021263,
                        "waveform": 1
                    }
                },
                "mixer": {
                    "volume1": {
                        "enabled": 1,
                        "level": 0.32
                    },
                    "volume2": {
                        "enabled": 1,
                        "level": 0.26
                    },
                    "volume3": {
                        "enabled": 1,
                        "level": 0.23
                    }
                },
                "noise": {
                    "enabled": 0,
                    "level": 0,
                    "type": 1
                },
                "envelopes": {
                    "primary": {
                        "attack": 0.28,
                        "decay": 0.78122,
                        "sustain": 0.83,
                        "release": 0.52
                    },
                    "filter": {
                        "attack": 0,
                        "decay": 0.52,
                        "sustain": 0.49051,
                        "release": 0.6
                    }
                },
                "filter": {
                    "cutoff": 2208,
                    "emphasis": 6.800000000000001,
                    "envAmount": 0.67
                },
                "lfo": {
                    "waveform": 2,
                    "rate": 1,
                    "amount": 0
                },
                "pitch": {
                    "bend": 0
                }
            }
        }
    },
    "Gryphon 1979": {
        "version": 6,
        "daw": {
            "pitch": {
                "bend": 0
            },
            "modulation": {
                "rate": 0
            },
            "compressor": {
                "enabled": 1,
                "threshold": -22.5,
                "ratio": 5.1000000000000005,
                "knee": 2,
                "attack": 0.1,
                "release": 20,
                "makeupGain": 2.1
            },
            "delay": {
                "time": 290,
                "feedback": 0.684,
                "dry": 0.57,
                "wet": 0.13
            },
            "reverb": {
                "level": 0.16
            },
            "masterVolume": {
                "level": 0.66
            }
        },
        "instruments": {
            "synth": {
                "polyphony": {
                    "voiceCount": 8,
                    "sustain": 0
                },
                "modulation": {
                    "waveform": 0,
                    "portamento": 0,
                    "rate": 0
                },
                "oscillator": {
                    "osc1": {
                        "range": -2,
                        "fineDetune": 0,
                        "waveform": 4
                    },
                    "osc2": {
                        "range": -1,
                        "fineDetune": 20.51282051282044,
                        "waveform": 2
                    },
                    "osc3": {
                        "range": -1,
                        "fineDetune": 17.51094434021263,
                        "waveform": 2
                    }
                },
                "mixer": {
                    "volume1": {
                        "enabled": 1,
                        "level": 0.25
                    },
                    "volume2": {
                        "enabled": 1,
                        "level": 0.23
                    },
                    "volume3": {
                        "enabled": 1,
                        "level": 0.32
                    }
                },
                "noise": {
                    "enabled": 0,
                    "level": 0,
                    "type": 1
                },
                "envelopes": {
                    "primary": {
                        "attack": 0.28,
                        "decay": 0.78122,
                        "sustain": 0.83,
                        "release": 0.52
                    },
                    "filter": {
                        "attack": 0,
                        "decay": 0.52,
                        "sustain": 0.49051,
                        "release": 0.6
                    }
                },
                "filter": {
                    "cutoff": 2208,
                    "emphasis": 6.800000000000001,
                    "envAmount": 0.67
                },
                "lfo": {
                    "waveform": 2,
                    "rate": 1,
                    "amount": 0
                },
                "pitch": {
                    "bend": 0
                }
            }
        }
    },
	"Orchestra Pad": {
		"version": 5,
		"daw": {
			"pitch": {
				"bend": 0
			},
			"modulation": {
				"rate": 0
			},
			"delay": {
				"time": 290,
				"feedback": 0.684,
				"dry": 1,
				"wet": 0.39
			},
			"reverb": {
				"level": 0.39
			},
			"masterVolume": {
				"level": 1
			}
		},
		"instruments": {
			"synth": {
				"polyphony": {
					"voiceCount": 10,
					"sustain": 0
				},
				"modulation": {
					"waveform": 3,
					"portamento": 0.013333333333333332,
					"rate": 0
				},
				"oscillator": {
					"osc1": {
						"range": -1,
						"fineDetune": 0,
						"waveform": 3
					},
					"osc2": {
						"range": -2,
						"fineDetune": -16.5103189493434,
						"waveform": 2
					},
					"osc3": {
						"range": 0,
						"fineDetune": 0,
						"waveform": 2
					}
				},
				"mixer": {
					"volume1": {
						"enabled": 1,
						"level": 0.42
					},
					"volume2": {
						"enabled": 1,
						"level": 0.17
					},
					"volume3": {
						"enabled": 1,
						"level": 0.34
					}
				},
				"noise": {
					"enabled": 0,
					"level": 0.59,
					"type": 0
				},
				"envelopes": {
					"primary": {
						"attack": 0,
						"decay": 0.06194,
						"sustain": 0.84,
						"release": 0.36
					},
					"filter": {
						"attack": 0.1,
						"decay": 0.08,
						"sustain": 0.27073,
						"release": 0.22
					}
				},
				"filter": {
					"cutoff": 2848,
					"emphasis": 0.4,
					"envAmount": 1
				},
				"lfo": {
					"waveform": 0,
					"rate": 1,
					"amount": 0.32
				},
				"pitch": {
					"bend": 0
				}
			}
		}
	},
	"Netjester Kush Pad": {
		"version": 5,
		"daw": {
			"pitch": {
				"bend": 0
			},
			"modulation": {
				"rate": 0
			},
			"delay": {
				"time": 270,
				"feedback": 0.261,
				"dry": 0.43,
				"wet": 0.45
			},
			"reverb": {
				"level": 0.19
			},
			"masterVolume": {
				"level": 0.9
			}
		},
		"instruments": {
			"synth": {
				"polyphony": {
					"voiceCount": 10,
					"sustain": 0
				},
				"modulation": {
					"waveform": 0,
					"portamento": 0.018333333333333333,
					"rate": 0
				},
				"oscillator": {
					"osc1": {
						"range": 0,
						"fineDetune": 0,
						"waveform": 4
					},
					"osc2": {
						"range": -1,
						"fineDetune": -800,
						"waveform": 0
					},
					"osc3": {
						"range": 0,
						"fineDetune": -13.508442776735478,
						"waveform": 2
					}
				},
				"mixer": {
					"volume1": {
						"enabled": 1,
						"level": 0.62
					},
					"volume2": {
						"enabled": 1,
						"level": 0.09
					},
					"volume3": {
						"enabled": 1,
						"level": 0.47
					}
				},
				"noise": {
					"enabled": 0,
					"level": 0.05,
					"type": 2
				},
				"envelopes": {
					"primary": {
						"attack": 0.96,
						"decay": 0.96104,
						"sustain": 0.4,
						"release": 1.12
					},
					"filter": {
						"attack": 1.42,
						"decay": 1.22,
						"sustain": 0.12088,
						"release": 0.76
					}
				},
				"filter": {
					"cutoff": 2608,
					"emphasis": 4.4,
					"envAmount": 1
				},
				"lfo": {
					"waveform": 0,
					"rate": 2,
					"amount": 0.57
				},
				"pitch": {
					"bend": 0
				}
			}
		}
	},
	"Bass Fanfares": {
		"version": 5,
		"daw": {
			"pitch": {
				"bend": 0
			},
			"modulation": {
				"rate": 0
			},
			"delay": {
				"time": 150,
				"feedback": 0.3,
				"dry": 1,
				"wet": 0
			},
			"reverb": {
				"level": 0
			},
			"masterVolume": {
				"level": 0.6
			}
		},
		"instruments": {
			"synth": {
				"polyphony": {
					"voiceCount": 10,
					"sustain": 0
				},
				"modulation": {
					"waveform": 0,
					"portamento": 0.008333333333333333,
					"rate": 0
				},
				"oscillator": {
					"osc1": {
						"range": -1,
						"fineDetune": 0,
						"waveform": 2
					},
					"osc2": {
						"range": -1,
						"fineDetune": -22.51407129455913,
						"waveform": 0
					},
					"osc3": {
						"range": -1,
						"fineDetune": 0,
						"waveform": 0
					}
				},
				"mixer": {
					"volume1": {
						"enabled": 1,
						"level": 0.6
					},
					"volume2": {
						"enabled": 1,
						"level": 0.14
					},
					"volume3": {
						"enabled": 0,
						"level": 0.6
					}
				},
				"noise": {
					"enabled": 0,
					"type": 0,
					"level": 0.2
				},
				"envelopes": {
					"primary": {
						"attack": 0,
						"decay": 0.002,
						"sustain": 0.82,
						"release": 0.04
					},
					"filter": {
						"attack": 0.5,
						"decay": 0.5,
						"sustain": 0.5,
						"release": 0.1
					}
				},
				"filter": {
					"cutoff": 724,
					"emphasis": 4.800000000000001,
					"envAmount": 0
				},
				"lfo": {
					"waveform": 0,
					"rate": 3,
					"amount": 0
				},
				"pitch": {
					"bend": 0
				}
			}
		}
	},
	"suitcase organ pad": {
		"version": 5,
		"daw": {
			"pitch": {
				"bend": 0
			},
			"modulation": {
				"rate": 0
			},
			"delay": {
				"time": 500,
				"feedback": 0.54,
				"dry": 1,
				"wet": 0.35
			},
			"reverb": {
				"level": 0.48
			},
			"masterVolume": {
				"level": 0.8
			}
		},
		"instruments": {
			"synth": {
				"polyphony": {
					"voiceCount": 1,
					"sustain": 0
				},
				"modulation": {
					"waveform": 1,
					"portamento": 0.003333333333333333,
					"rate": 0
				},
				"oscillator": {
					"osc1": {
						"range": -1,
						"fineDetune": 0,
						"waveform": 2
					},
					"osc2": {
						"range": -3,
						"fineDetune": 800,
						"waveform": 4
					},
					"osc3": {
						"range": -2,
						"fineDetune": -400,
						"waveform": 3
					}
				},
				"mixer": {
					"volume1": {
						"enabled": 1,
						"level": 0.3
					},
					"volume2": {
						"enabled": 1,
						"level": 0.37
					},
					"volume3": {
						"enabled": 1,
						"level": 0.44
					}
				},
				"noise": {
					"enabled": 0,
					"type": 0,
					"level": 0.2
				},
				"envelopes": {
					"primary": {
						"attack": 1.38,
						"decay": 0.02198,
						"sustain": 0.87,
						"release": 1.18
					},
					"filter": {
						"attack": 0.98,
						"decay": 0.9,
						"sustain": 0.5,
						"release": 0.74
					}
				},
				"filter": {
					"cutoff": 352,
					"emphasis": 5.200000000000001,
					"envAmount": 0
				},
				"lfo": {
					"waveform": 0,
					"rate": 25,
					"amount": 0
				},
				"pitch": {
					"bend": 0
				}
			}
		}
	},


	"Organ Thingie": {
		"version": 3,
		"daw": {
			"pitch": {
				"bend": 0
			},
			"modulation": {
				"rate": 0
			},
			"delay": {
				"time": 450,
				"feedback": 0.387,
				"dry": 0.66,
				"wet": 0
			},
			"reverb": {
				"level": 0.1
			},
			"masterVolume": {
				"level": 0.84
			}
		},
		"instruments": {
			"synth": {
				"polyphony": {
					"voiceCount": 10
				},
				"modulation": {
					"waveform": 0,
					"portamento": 0,
					"rate": 0
				},
				"oscillator": {
					"osc1": {
						"range": 0,
						"fineDetune": 0,
						"waveform": 2
					},
					"osc2": {
						"range": 1,
						"fineDetune": 0,
						"waveform": 2
					},
					"osc3": {
						"range": -1,
						"fineDetune": 0,
						"waveform": 0
					}
				},
				"mixer": {
					"volume1": {
						"enabled": 1,
						"level": 0.4
					},
					"volume2": {
						"enabled": 1,
						"level": 0.25
					},
					"volume3": {
						"enabled": 1,
						"level": 0.4
					}
				},
				"noise": {
					"enabled": 0,
					"level": 0.03,
					"type": 0
				},
				"envelopes": {
					"primary": {
						"attack": 0,
						"decay": 0.002,
						"sustain": 0.53,
						"release": 0
					},
					"filter": {
						"attack": 0.12,
						"decay": 0.12,
						"sustain": 0.01099,
						"release": 0.92
					}
				},
				"filter": {
					"cutoff": 8000,
					"emphasis": 0.4,
					"envAmount": 0
				},
				"lfo": {
					"waveform": 0,
					"rate": 3,
					"amount": 0
				},
				"pitch": {
					"bend": 0
				}
			}
		}
	},
	"Electric Piano": {
		"version": 3,
		"daw": {
			"pitch": {
				"bend": 0
			},
			"modulation": {
				"rate": 0
			},
			"delay": {
				"time": 450,
				"feedback": 0.387,
				"dry": 0.66,
				"wet": 0
			},
			"reverb": {
				"level": 0.1
			},
			"masterVolume": {
				"level": 0.84
			}
		},
		"instruments": {
			"synth": {
				"polyphony": {
					"voiceCount": 10
				},
				"modulation": {
					"waveform": 0,
					"portamento": 0,
					"rate": 0
				},
				"oscillator": {
					"osc1": {
						"range": 1,
						"fineDetune": 0,
						"waveform": 0
					},
					"osc2": {
						"range": 2,
						"fineDetune": 0,
						"waveform": 5
					},
					"osc3": {
						"range": -1,
						"fineDetune": 0,
						"waveform": 0
					}
				},
				"mixer": {
					"volume1": {
						"enabled": 1,
						"level": 0.4
					},
					"volume2": {
						"enabled": 0,
						"level": 0.25
					},
					"volume3": {
						"enabled": 0,
						"level": 0.4
					}
				},
				"noise": {
					"enabled": 0,
					"level": 0.03,
					"type": 0
				},
				"envelopes": {
					"primary": {
						"attack": 0,
						"decay": 0.002,
						"sustain": 0.53,
						"release": 0.02
					},
					"filter": {
						"attack": 0.12,
						"decay": 0.12,
						"sustain": 0.01099,
						"release": 0.92
					}
				},
				"filter": {
					"cutoff": 8000,
					"emphasis": 0.4,
					"envAmount": 0
				},
				"lfo": {
					"waveform": 0,
					"rate": 3,
					"amount": 0
				},
				"pitch": {
					"bend": 0
				}
			}
		}
	},
	"8-bit Shogun": {
		"version": 3,
		"daw": {
			"pitch": {
				"bend": 0
			},
			"modulation": {
				"rate": 0
			},
			"delay": {
				"time": 450,
				"feedback": 0.387,
				"dry": 0.66,
				"wet": 0.28
			},
			"reverb": {
				"level": 0.1
			},
			"masterVolume": {
				"level": 0.84
			}
		},
		"instruments": {
			"synth": {
				"polyphony": {
					"voiceCount": 10
				},
				"modulation": {
					"waveform": 0,
					"portamento": 0,
					"rate": 0
				},
				"oscillator": {
					"osc1": {
						"range": 1,
						"fineDetune": 0,
						"waveform": 2
					},
					"osc2": {
						"range": 2,
						"fineDetune": -5,
						"waveform": 2
					},
					"osc3": {
						"range": -1,
						"fineDetune": 0,
						"waveform": 0
					}
				},
				"mixer": {
					"volume1": {
						"enabled": 1,
						"level": 0.4
					},
					"volume2": {
						"enabled": 1,
						"level": 0.25
					},
					"volume3": {
						"enabled": 0,
						"level": 0.4
					}
				},
				"noise": {
					"enabled": 0,
					"level": 0.03,
					"type": 0
				},
				"envelopes": {
					"primary": {
						"attack": 0,
						"decay": 0.002,
						"sustain": 0.53,
						"release": 0.02
					},
					"filter": {
						"attack": 0.12,
						"decay": 0.12,
						"sustain": 0.01099,
						"release": 0.92
					}
				},
				"filter": {
					"cutoff": 8000,
					"emphasis": 0.4,
					"envAmount": 0
				},
				"lfo": {
					"waveform": 0,
					"rate": 3,
					"amount": 0
				},
				"pitch": {
					"bend": 0
				}
			}
		}
	},
	"Electric Clavessine": {
		"version": 3,
		"daw": {
			"pitch": {
				"bend": 0
			},
			"modulation": {
				"rate": 0
			},
			"delay": {
				"time": 450,
				"feedback": 0.387,
				"dry": 0.66,
				"wet": 0
			},
			"reverb": {
				"level": 0.1
			},
			"masterVolume": {
				"level": 0.84
			}
		},
		"instruments": {
			"synth": {
				"polyphony": {
					"voiceCount": 10
				},
				"modulation": {
					"waveform": 0,
					"portamento": 0,
					"rate": 0
				},
				"oscillator": {
					"osc1": {
						"range": 0,
						"fineDetune": 0,
						"waveform": 2
					},
					"osc2": {
						"range": 1,
						"fineDetune": 0,
						"waveform": 2
					},
					"osc3": {
						"range": -1,
						"fineDetune": 0,
						"waveform": 0
					}
				},
				"mixer": {
					"volume1": {
						"enabled": 1,
						"level": 0.4
					},
					"volume2": {
						"enabled": 1,
						"level": 0.25
					},
					"volume3": {
						"enabled": 0,
						"level": 0.4
					}
				},
				"noise": {
					"enabled": 0,
					"level": 0.03,
					"type": 0
				},
				"envelopes": {
					"primary": {
						"attack": 0,
						"decay": 0.002,
						"sustain": 0.53,
						"release": 0.02
					},
					"filter": {
						"attack": 0.12,
						"decay": 0.12,
						"sustain": 0.01099,
						"release": 0.92
					}
				},
				"filter": {
					"cutoff": 8000,
					"emphasis": 0.4,
					"envAmount": 0
				},
				"lfo": {
					"waveform": 0,
					"rate": 3,
					"amount": 0
				},
				"pitch": {
					"bend": 0
				}
			}
		}
	},
	"Moog Triangle Bass": {
		"daw": {
			"pitch": {
				"bend": {
					"value": 0,
					"range": [-200, 200]
				}
			},
			"modulation": {
				"rate": {
					"value": 0,
					"range": [0, 15]
				}
			},
			"delay": {
				"time": {
					"value": 460,
					"range": [0, 1000]
				},
				"feedback": {
					"value": 0.47700000000000004,
					"range": [0, 0.9]
				},
				"dry": {
					"value": 1,
					"range": [0, 1]
				},
				"wet": {
					"value": 0,
					"range": [0, 1]
				}
			},
			"reverb": {
				"level": {
					"value": 0,
					"range": [0, 1]
				}
			},
			"masterVolume": {
				"level": {
					"value": 1,
					"range": [0, 1]
				}
			}
		},
		"instruments": {
			"synth": {
				"modulation": {
					"waveform": {
						"value": 0,
						"range": [0, 5]
					},
					"portamento": {
						"value": 0.0016666666666666666,
						"range": [0, 0.16666666666666666]
					},
					"rate": {
						"value": 0,
						"range": [0, 15]
					}
				},
				"oscillator": {
					"osc1": {
						"range": {
							"value": -2,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 3,
							"range": [0, 5]
						}
					},
					"osc2": {
						"range": {
							"value": -3,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 3,
							"range": [0, 5]
						}
					},
					"osc3": {
						"range": {
							"value": -4,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 3,
							"range": [0, 5]
						}
					}
				},
				"mixer": {
					"volume1": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.12,
							"range": [0, 1]
						}
					},
					"volume2": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.38,
							"range": [0, 1]
						}
					},
					"volume3": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.7,
							"range": [0, 1]
						}
					}
				},
				"noise": {
					"enabled": {
						"value": 0,
						"range": [0, 1]
					},
					"level": {
						"value": 0.17,
						"range": [0, 1]
					},
					"type": {
						"value": 0,
						"range": [0, 2]
					}
				},
				"envelopes": {
					"primary": {
						"attack": {
							"value": 0,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.002,
							"range": [0.002, 2]
						},
						"sustain": {
							"value": 0.73,
							"range": [0, 1]
						},
						"release": {
							"value": 0.02,
							"range": [0, 2]
						}
					},
					"filter": {
						"attack": {
							"value": 0.14,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.2,
							"range": [0, 2]
						},
						"sustain": {
							"value": 0.16084,
							"range": [0.001, 1]
						},
						"release": {
							"value": 0.48,
							"range": [0, 2]
						}
					}
				},
				"filter": {
					"cutoff": {
						"value": 1248,
						"range": [0, 8000]
					},
					"emphasis": {
						"value": 22.4,
						"range": [0.4, 40]
					},
					"envAmount": {
						"value": 0,
						"range": [0, 1]
					}
				},
				"lfo": {
					"waveform": {
						"value": 0,
						"range": [0, 5]
					},
					"rate": {
						"value": 6,
						"range": [1, 25]
					},
					"amount": {
						"value": 0,
						"range": [0, 1]
					}
				},
				"pitch": {
					"bend": {
						"value": 0,
						"range": [-200, 200]
					}
				}
			}
		}
	},
	"Accordion": {
		"version": 3,
		"daw": {
			"pitch": {
				"bend": 0
			},
			"modulation": {
				"rate": 0
			},
			"delay": {
				"time": 280,
				"feedback": 0.5940000000000001,
				"dry": 0.66,
				"wet": 0
			},
			"reverb": {
				"level": 0
			},
			"masterVolume": {
				"level": 0.84
			}
		},
		"instruments": {
			"synth": {
				"polyphony": {
					"voiceCount": 10
				},
				"modulation": {
					"waveform": 0,
					"portamento": 0,
					"rate": 0
				},
				"oscillator": {
					"osc1": {
						"range": 0,
						"fineDetune": 0,
						"waveform": 2
					},
					"osc2": {
						"range": 2,
						"fineDetune": -5,
						"waveform": 2
					},
					"osc3": {
						"range": -2,
						"fineDetune": 0,
						"waveform": 1
					}
				},
				"mixer": {
					"volume1": {
						"enabled": 1,
						"level": 0.4
					},
					"volume2": {
						"enabled": 1,
						"level": 0.2
					},
					"volume3": {
						"enabled": 1,
						"level": 0.4
					}
				},
				"noise": {
					"enabled": 0,
					"level": 0.49,
					"type": 0
				},
				"envelopes": {
					"primary": {
						"attack": 0.28,
						"decay": 1.04096,
						"sustain": 0.39,
						"release": 0
					},
					"filter": {
						"attack": 0.02,
						"decay": 1.8,
						"sustain": 0.05095,
						"release": 0.92
					}
				},
				"filter": {
					"cutoff": 8000,
					"emphasis": 5.600000000000001,
					"envAmount": 1
				},
				"lfo": {
					"waveform": 3,
					"rate": 6,
					"amount": 0
				},
				"pitch": {
					"bend": 0
				}
			}
		}
	},
	"Clean Sine": {
		daw: {
			pitch: {
				bend: {
					value: 0,
					range: [ -200, 200 ]
				}
			},
			modulation: {
				rate: {
					value: 0,
					range: [ 0, 15 ]
				}
			},
			delay: {
				time: {
					value: 150,
					range: [ 0, 1000 ]
				},
				feedback: {
					value: 0.3,
					range: [ 0, 0.9 ]
				},
				dry: {
					value: 1,
					range: [ 0, 1 ]
				},
				wet: {
					value: 0,
					range: [ 0, 1 ]
				}
			},
			reverb: {
				level: {
					value: 0,
					range: [ 0, 1 ]
				}
			},
			masterVolume: {
				level: {
					value: 0.8,
					range: [ 0, 1 ]
				}
			}
		},
		instruments: {
			"synth": {
				pitch: {
					bend: {
						value: 0,
						range: [ -200, 200 ]
					}
				},
				modulation: {
					waveform: {
						value: 0,
						range: [ 0, 5 ]
					},
					portamento: {
						value: 5 / 100 / 6,
						range: [ 0, 1/6 ]
					},
					rate: {
						value: 0,
						range: [ 0, 15 ]
					}
				},
				oscillator: {
					osc1: {
						range: {
							value: 0,
							range: [ -4, 2 ]
						},
						fineDetune: {
							value: 0,
							range: [ -8, 8 ]
						},
						waveform: {
							value: 0,
							range: [ 0, 5 ]
						}
					},
					osc2: {
						range: {
							value: 0,
							range: [ -4, 2 ]
						},
						fineDetune: {
							value: 0,
							range: [ -8, 8 ]
						},
						waveform: {
							value: 0,
							range: [ 0, 5 ]
						}
					},
					osc3: {
						range: {
							value: -1,
							range: [ -4, 2 ]
						},
						fineDetune: {
							value: 0,
							range: [ -8, 8 ]
						},
						waveform: {
							value: 0,
							range: [ 0, 5 ]
						}
					}
				},
				mixer: {
					volume1: {
						enabled: {
							value: 1,
							range: [ 0, 1 ]
						},
						level: {
							value: 0.6,
							range: [ 0, 1 ]
						}
					},
					volume2: {
						enabled: {
							value: 0,
							range: [ 0, 1 ]
						},
						level: {
							value: 0.6,
							range: [ 0, 1 ]
						}
					},
					volume3: {
						enabled: {
							value: 0,
							range: [ 0, 1 ]
						},
						level: {
							value: 0.6,
							range: [ 0, 1 ]
						}
					}
				},
				noise: {
					enabled: {
						value: 0,
						range: [ 0, 1 ]
					},
					type: {
						value: 0,
						range: [ 0, 2 ]
					},
					level: {
						value: 0.2,
						range: [ 0, 1 ]
					}
				},
				envelopes: {
					primary: {
						attack: {
							value: 0.5,
							range: [ 0, 2 ]
						},
						decay: {
							value: 0.5,
							range: [ 0.002, 2 ]
						},
						sustain: {
							value: 0.5,
							range: [ 0, 1 ]
						},
						release: {
							value: 0.1,
							range: [ 0, 2 ]
						}
					},
					filter: {
						attack: {
							value: 0.5,
							range: [ 0, 2 ]
						},
						decay: {
							value: 0.5,
							range: [ 0, 2 ]
						},
						sustain: {
							value: 0.5,
							range: [ 0.001, 1 ]
						},
						release: {
							value: 0.1,
							range: [ 0, 2 ]
						}
					}
				},
				filter: {
					cutoff: {
						value: 4000,
						range: [ 0, 8000 ]
					},
					emphasis: {
						value: 2,
						range: [ 0.4, 40 ]
					},
					envAmount: {
						value: 0,
						range: [ 0, 1 ]
					}
				},
				lfo: {
					waveform: {
						value: 0,
						range: [ 0, 5 ]
					},
					rate: {
						value: 3,
						range: [ 1, 25 ]
					},
					amount: {
						value: 0,
						range: [ 0, 1 ]
					}
				}
			}
		}
	},
	"Vesi": {
		"daw": {
			"pitch": {
				"bend": {
					"value": 0,
					"range": [-200, 200]
				}
			},
			"modulation": {
				"rate": {
					"value": 0,
					"range": [0, 15]
				}
			},
			"delay": {
				"time": {
					"value": 370,
					"range": [0, 1000]
				},
				"feedback": {
					"value": 0.5670000000000001,
					"range": [0, 0.9]
				},
				"dry": {
					"value": 1,
					"range": [0, 1]
				},
				"wet": {
					"value": 0.4,
					"range": [0, 1]
				}
			},
			"reverb": {
				"level": {
					"value": 0.24,
					"range": [0, 1]
				}
			},
			"masterVolume": {
				"level": {
					"value": 0.8,
					"range": [0, 1]
				}
			}
		},
		"instruments": {
			"synth": {
				"modulation": {
					"waveform": {
						"value": 0,
						"range": [0, 5]
					},
					"portamento": {
						"value": 0.008333333333333333,
						"range": [0, 0.16666666666666666]
					},
					"rate": {
						"value": 0,
						"range": [0, 15]
					}
				},
				"oscillator": {
					"osc1": {
						"range": {
							"value": 0,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 0,
							"range": [0, 5]
						}
					},
					"osc2": {
						"range": {
							"value": 0,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 0,
							"range": [0, 5]
						}
					},
					"osc3": {
						"range": {
							"value": -1,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 0,
							"range": [0, 5]
						}
					}
				},
				"mixer": {
					"volume1": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.6,
							"range": [0, 1]
						}
					},
					"volume2": {
						"enabled": {
							"value": 0,
							"range": [0, 1]
						},
						"level": {
							"value": 0.6,
							"range": [0, 1]
						}
					},
					"volume3": {
						"enabled": {
							"value": 0,
							"range": [0, 1]
						},
						"level": {
							"value": 0.6,
							"range": [0, 1]
						}
					}
				},
				"noise": {
					"enabled": {
						"value": 0,
						"range": [0, 1]
					},
					"type": {
						"value": 0,
						"range": [0, 2]
					},
					"level": {
						"value": 0.2,
						"range": [0, 1]
					}
				},
				"envelopes": {
					"primary": {
						"attack": {
							"value": 0.5,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.5,
							"range": [0.002, 2]
						},
						"sustain": {
							"value": 0.5,
							"range": [0, 1]
						},
						"release": {
							"value": 0.1,
							"range": [0, 2]
						}
					},
					"filter": {
						"attack": {
							"value": 0.5,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.5,
							"range": [0, 2]
						},
						"sustain": {
							"value": 0.5,
							"range": [0.001, 1]
						},
						"release": {
							"value": 0.1,
							"range": [0, 2]
						}
					}
				},
				"filter": {
					"cutoff": {
						"value": 4000,
						"range": [0, 8000]
					},
					"emphasis": {
						"value": 2,
						"range": [0.4, 40]
					},
					"envAmount": {
						"value": 0,
						"range": [0, 1]
					}
				},
				"lfo": {
					"waveform": {
						"value": 0,
						"range": [0, 5]
					},
					"rate": {
						"value": 3,
						"range": [1, 25]
					},
					"amount": {
						"value": 0,
						"range": [0, 1]
					}
				},
				"pitch": {
					"bend": {
						"value": 0,
						"range": [-200, 200]
					}
				}
			}
		}
	},
	"Muffled": {
		"daw": {
			"pitch": {
				"bend": {
					"value": 0,
					"range": [-200, 200]
				}
			},
			"modulation": {
				"rate": {
					"value": 0,
					"range": [0, 15]
				}
			},
			"delay": {
				"time": {
					"value": 370,
					"range": [0, 1000]
				},
				"feedback": {
					"value": 0.5670000000000001,
					"range": [0, 0.9]
				},
				"dry": {
					"value": 1,
					"range": [0, 1]
				},
				"wet": {
					"value": 0.4,
					"range": [0, 1]
				}
			},
			"reverb": {
				"level": {
					"value": 0.28,
					"range": [0, 1]
				}
			},
			"masterVolume": {
				"level": {
					"value": 1,
					"range": [0, 1]
				}
			}
		},
		"instruments": {
			"synth": {
				"modulation": {
					"waveform": {
						"value": 0,
						"range": [0, 5]
					},
					"portamento": {
						"value": 0.008333333333333333,
						"range": [0, 0.16666666666666666]
					},
					"rate": {
						"value": 0,
						"range": [0, 15]
					}
				},
				"oscillator": {
					"osc1": {
						"range": {
							"value": 0,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 0,
							"range": [0, 5]
						}
					},
					"osc2": {
						"range": {
							"value": 0,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 0,
							"range": [0, 5]
						}
					},
					"osc3": {
						"range": {
							"value": -1,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 0,
							"range": [0, 5]
						}
					}
				},
				"mixer": {
					"volume1": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.38,
							"range": [0, 1]
						}
					},
					"volume2": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.42,
							"range": [0, 1]
						}
					},
					"volume3": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.33,
							"range": [0, 1]
						}
					}
				},
				"noise": {
					"enabled": {
						"value": 0,
						"range": [0, 1]
					},
					"type": {
						"value": 0,
						"range": [0, 2]
					},
					"level": {
						"value": 0.2,
						"range": [0, 1]
					}
				},
				"envelopes": {
					"primary": {
						"attack": {
							"value": 0.5,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.5,
							"range": [0.002, 2]
						},
						"sustain": {
							"value": 0.5,
							"range": [0, 1]
						},
						"release": {
							"value": 0.1,
							"range": [0, 2]
						}
					},
					"filter": {
						"attack": {
							"value": 0.5,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.5,
							"range": [0, 2]
						},
						"sustain": {
							"value": 0.5,
							"range": [0.001, 1]
						},
						"release": {
							"value": 0.1,
							"range": [0, 2]
						}
					}
				},
				"filter": {
					"cutoff": {
						"value": 4000,
						"range": [0, 8000]
					},
					"emphasis": {
						"value": 2,
						"range": [0.4, 40]
					},
					"envAmount": {
						"value": 0,
						"range": [0, 1]
					}
				},
				"lfo": {
					"waveform": {
						"value": 0,
						"range": [0, 5]
					},
					"rate": {
						"value": 3,
						"range": [1, 25]
					},
					"amount": {
						"value": 0,
						"range": [0, 1]
					}
				},
				"pitch": {
					"bend": {
						"value": 0,
						"range": [-200, 200]
					}
				}
			}
		}
	},
	"Quiet voice": {
		"daw": {
			"pitch": {
				"bend": {
					"value": 0,
					"range": [-200, 200]
				}
			},
			"modulation": {
				"rate": {
					"value": 0,
					"range": [0, 15]
				}
			},
			"delay": {
				"time": {
					"value": 370,
					"range": [0, 1000]
				},
				"feedback": {
					"value": 0.5670000000000001,
					"range": [0, 0.9]
				},
				"dry": {
					"value": 1,
					"range": [0, 1]
				},
				"wet": {
					"value": 0.4,
					"range": [0, 1]
				}
			},
			"reverb": {
				"level": {
					"value": 0.28,
					"range": [0, 1]
				}
			},
			"masterVolume": {
				"level": {
					"value": 1,
					"range": [0, 1]
				}
			}
		},
		"instruments": {
			"synth": {
				"modulation": {
					"waveform": {
						"value": 3,
						"range": [0, 5]
					},
					"portamento": {
						"value": 0,
						"range": [0, 0.16666666666666666]
					},
					"rate": {
						"value": 1.5354330708661417,
						"range": [0, 15]
					}
				},
				"oscillator": {
					"osc1": {
						"range": {
							"value": 0,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 0,
							"range": [0, 5]
						}
					},
					"osc2": {
						"range": {
							"value": 0,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 0,
							"range": [0, 5]
						}
					},
					"osc3": {
						"range": {
							"value": 2,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 0,
							"range": [0, 5]
						}
					}
				},
				"mixer": {
					"volume1": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.27,
							"range": [0, 1]
						}
					},
					"volume2": {
						"enabled": {
							"value": 0,
							"range": [0, 1]
						},
						"level": {
							"value": 0.6,
							"range": [0, 1]
						}
					},
					"volume3": {
						"enabled": {
							"value": 0,
							"range": [0, 1]
						},
						"level": {
							"value": 0.6,
							"range": [0, 1]
						}
					}
				},
				"noise": {
					"enabled": {
						"value": 0,
						"range": [0, 1]
					},
					"level": {
						"value": 0,
						"range": [0, 1]
					},
					"type": {
						"value": 0,
						"range": [0, 2]
					}
				},
				"envelopes": {
					"primary": {
						"attack": {
							"value": 0.5,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.5,
							"range": [0.002, 2]
						},
						"sustain": {
							"value": 0.5,
							"range": [0, 1]
						},
						"release": {
							"value": 0.56,
							"range": [0, 2]
						}
					},
					"filter": {
						"attack": {
							"value": 0.5,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.5,
							"range": [0, 2]
						},
						"sustain": {
							"value": 0.5,
							"range": [0.001, 1]
						},
						"release": {
							"value": 0.1,
							"range": [0, 2]
						}
					}
				},
				"filter": {
					"cutoff": {
						"value": 4000,
						"range": [0, 8000]
					},
					"emphasis": {
						"value": 12.8,
						"range": [0.4, 40]
					},
					"envAmount": {
						"value": 0,
						"range": [0, 1]
					}
				},
				"lfo": {
					"waveform": {
						"value": 0,
						"range": [0, 5]
					},
					"rate": {
						"value": 3,
						"range": [1, 25]
					},
					"amount": {
						"value": 0,
						"range": [0, 1]
					}
				},
				"pitch": {
					"bend": {
						"value": 0,
						"range": [-200, 200]
					}
				}
			}
		}
	},
	"Triangle and Saw": {
		"daw": {
			"pitch": {
				"bend": {
					"value": 0,
					"range": [-200, 200]
				}
			},
			"modulation": {
				"rate": {
					"value": 0,
					"range": [0, 15]
				}
			},
			"delay": {
				"time": {
					"value": 430,
					"range": [0, 1000]
				},
				"feedback": {
					"value": 0.531,
					"range": [0, 0.9]
				},
				"dry": {
					"value": 1,
					"range": [0, 1]
				},
				"wet": {
					"value": 0.47,
					"range": [0, 1]
				}
			},
			"reverb": {
				"level": {
					"value": 0.22,
					"range": [0, 1]
				}
			},
			"masterVolume": {
				"level": {
					"value": 1,
					"range": [0, 1]
				}
			}
		},
		"instruments": {
			"synth": {
				"modulation": {
					"waveform": {
						"value": 5,
						"range": [0, 5]
					},
					"portamento": {
						"value": 0.013333333333333332,
						"range": [0, 0.16666666666666666]
					},
					"rate": {
						"value": 0,
						"range": [0, 15]
					}
				},
				"oscillator": {
					"osc1": {
						"range": {
							"value": 0,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 3,
							"range": [0, 5]
						}
					},
					"osc2": {
						"range": {
							"value": 0,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 2,
							"range": [0, 5]
						}
					},
					"osc3": {
						"range": {
							"value": -1,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 0,
							"range": [0, 5]
						}
					}
				},
				"mixer": {
					"volume1": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.64,
							"range": [0, 1]
						}
					},
					"volume2": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.28,
							"range": [0, 1]
						}
					},
					"volume3": {
						"enabled": {
							"value": 0,
							"range": [0, 1]
						},
						"level": {
							"value": 0.6,
							"range": [0, 1]
						}
					}
				},
				"noise": {
					"enabled": {
						"value": 0,
						"range": [0, 1]
					},
					"type": {
						"value": 0,
						"range": [0, 2]
					},
					"level": {
						"value": 0.2,
						"range": [0, 1]
					}
				},
				"envelopes": {
					"primary": {
						"attack": {
							"value": 0.5,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.5,
							"range": [0.002, 2]
						},
						"sustain": {
							"value": 0.5,
							"range": [0, 1]
						},
						"release": {
							"value": 0.1,
							"range": [0, 2]
						}
					},
					"filter": {
						"attack": {
							"value": 0.5,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.5,
							"range": [0, 2]
						},
						"sustain": {
							"value": 0.5,
							"range": [0.001, 1]
						},
						"release": {
							"value": 0.1,
							"range": [0, 2]
						}
					}
				},
				"filter": {
					"cutoff": {
						"value": 5424,
						"range": [0, 8000]
					},
					"emphasis": {
						"value": 13.200000000000001,
						"range": [0.4, 40]
					},
					"envAmount": {
						"value": 0,
						"range": [0, 1]
					}
				},
				"lfo": {
					"waveform": {
						"value": 0,
						"range": [0, 5]
					},
					"rate": {
						"value": 1,
						"range": [1, 25]
					},
					"amount": {
						"value": 0,
						"range": [0, 1]
					}
				},
				"pitch": {
					"bend": {
						"value": 0,
						"range": [-200, 200]
					}
				}
			}
		}
	},
	"Mnogoglas": {
		"daw": {
			"pitch": {
				"bend": {
					"value": 0,
					"range": [-200, 200]
				}
			},
			"modulation": {
				"rate": {
					"value": 0,
					"range": [0, 15]
				}
			},
			"delay": {
				"time": {
					"value": 370,
					"range": [0, 1000]
				},
				"feedback": {
					"value": 0.5670000000000001,
					"range": [0, 0.9]
				},
				"dry": {
					"value": 1,
					"range": [0, 1]
				},
				"wet": {
					"value": 0.4,
					"range": [0, 1]
				}
			},
			"reverb": {
				"level": {
					"value": 0.28,
					"range": [0, 1]
				}
			},
			"masterVolume": {
				"level": {
					"value": 1,
					"range": [0, 1]
				}
			}
		},
		"instruments": {
			"synth": {
				"modulation": {
					"waveform": {
						"value": 0,
						"range": [0, 5]
					},
					"portamento": {
						"value": 0.008333333333333333,
						"range": [0, 0.16666666666666666]
					},
					"rate": {
						"value": 0,
						"range": [0, 15]
					}
				},
				"oscillator": {
					"osc1": {
						"range": {
							"value": 0,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 0,
							"range": [0, 5]
						}
					},
					"osc2": {
						"range": {
							"value": 0,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": -7,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 0,
							"range": [0, 5]
						}
					},
					"osc3": {
						"range": {
							"value": 2,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": -7,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 0,
							"range": [0, 5]
						}
					}
				},
				"mixer": {
					"volume1": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.37,
							"range": [0, 1]
						}
					},
					"volume2": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.11,
							"range": [0, 1]
						}
					},
					"volume3": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.35,
							"range": [0, 1]
						}
					}
				},
				"noise": {
					"enabled": {
						"value": 0,
						"range": [0, 1]
					},
					"level": {
						"value": 0,
						"range": [0, 1]
					},
					"type": {
						"value": 0,
						"range": [0, 2]
					}
				},
				"envelopes": {
					"primary": {
						"attack": {
							"value": 0.5,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.5,
							"range": [0.002, 2]
						},
						"sustain": {
							"value": 0.5,
							"range": [0, 1]
						},
						"release": {
							"value": 0.1,
							"range": [0, 2]
						}
					},
					"filter": {
						"attack": {
							"value": 0.5,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.5,
							"range": [0, 2]
						},
						"sustain": {
							"value": 0.5,
							"range": [0.001, 1]
						},
						"release": {
							"value": 0.1,
							"range": [0, 2]
						}
					}
				},
				"filter": {
					"cutoff": {
						"value": 4000,
						"range": [0, 8000]
					},
					"emphasis": {
						"value": 2,
						"range": [0.4, 40]
					},
					"envAmount": {
						"value": 0,
						"range": [0, 1]
					}
				},
				"lfo": {
					"waveform": {
						"value": 5,
						"range": [0, 5]
					},
					"rate": {
						"value": 1,
						"range": [1, 25]
					},
					"amount": {
						"value": 0,
						"range": [0, 1]
					}
				},
				"pitch": {
					"bend": {
						"value": 0,
						"range": [-200, 200]
					}
				}
			}
		}
	},
	"Space Trumpet": {
		"daw": {
			"pitch": {
				"bend": {
					"value": 0,
					"range": [-200, 200]
				}
			},
			"modulation": {
				"rate": {
					"value": 0,
					"range": [0, 15]
				}
			},
			"delay": {
				"time": {
					"value": 290,
					"range": [0, 1000]
				},
				"feedback": {
					"value": 0.684,
					"range": [0, 0.9]
				},
				"dry": {
					"value": 1,
					"range": [0, 1]
				},
				"wet": {
					"value": 0.39,
					"range": [0, 1]
				}
			},
			"reverb": {
				"level": {
					"value": 0.39,
					"range": [0, 1]
				}
			},
			"masterVolume": {
				"level": {
					"value": 1,
					"range": [0, 1]
				}
			}
		},
		"instruments": {
			"synth": {
				"modulation": {
					"waveform": {
						"value": 3,
						"range": [0, 5]
					},
					"portamento": {
						"value": 0.013333333333333332,
						"range": [0, 0.16666666666666666]
					},
					"rate": {
						"value": 0,
						"range": [0, 15]
					}
				},
				"oscillator": {
					"osc1": {
						"range": {
							"value": -1,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 3,
							"range": [0, 5]
						}
					},
					"osc2": {
						"range": {
							"value": -2,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 2,
							"range": [0, 5]
						}
					},
					"osc3": {
						"range": {
							"value": 0,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 2,
							"range": [0, 5]
						}
					}
				},
				"mixer": {
					"volume1": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.42,
							"range": [0, 1]
						}
					},
					"volume2": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.17,
							"range": [0, 1]
						}
					},
					"volume3": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.34,
							"range": [0, 1]
						}
					}
				},
				"noise": {
					"enabled": {
						"value": 0,
						"range": [0, 1]
					},
					"level": {
						"value": 0.59,
						"range": [0, 1]
					},
					"type": {
						"value": 0,
						"range": [0, 2]
					}
				},
				"envelopes": {
					"primary": {
						"attack": {
							"value": 0,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.06194,
							"range": [0.002, 2]
						},
						"sustain": {
							"value": 0.84,
							"range": [0, 1]
						},
						"release": {
							"value": 0.36,
							"range": [0, 2]
						}
					},
					"filter": {
						"attack": {
							"value": 0.1,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.08,
							"range": [0, 2]
						},
						"sustain": {
							"value": 0.27073,
							"range": [0.001, 1]
						},
						"release": {
							"value": 0.22,
							"range": [0, 2]
						}
					}
				},
				"filter": {
					"cutoff": {
						"value": 2848,
						"range": [0, 8000]
					},
					"emphasis": {
						"value": 0.4,
						"range": [0.4, 40]
					},
					"envAmount": {
						"value": 1,
						"range": [0, 1]
					}
				},
				"lfo": {
					"waveform": {
						"value": 0,
						"range": [0, 5]
					},
					"rate": {
						"value": 1,
						"range": [1, 25]
					},
					"amount": {
						"value": 0.32,
						"range": [0, 1]
					}
				},
				"pitch": {
					"bend": {
						"value": 0,
						"range": [-200, 200]
					}
				}
			}
		}
	},
	"Space Trumpet 2": {
		"daw": {
			"pitch": {
				"bend": {
					"value": 0,
					"range": [-200, 200]
				}
			},
			"modulation": {
				"rate": {
					"value": 0,
					"range": [0, 15]
				}
			},
			"delay": {
				"time": {
					"value": 450,
					"range": [0, 1000]
				},
				"feedback": {
					"value": 0.387,
					"range": [0, 0.9]
				},
				"dry": {
					"value": 0.66,
					"range": [0, 1]
				},
				"wet": {
					"value": 0.42,
					"range": [0, 1]
				}
			},
			"reverb": {
				"level": {
					"value": 0.35,
					"range": [0, 1]
				}
			},
			"masterVolume": {
				"level": {
					"value": 0.5,
					"range": [0, 1]
				}
			}
		},
		"instruments": {
			"synth": {
				"modulation": {
					"waveform": {
						"value": 0,
						"range": [0, 5]
					},
					"portamento": {
						"value": 0,
						"range": [0, 0.16666666666666666]
					},
					"rate": {
						"value": 0,
						"range": [0, 15]
					}
				},
				"oscillator": {
					"osc1": {
						"range": {
							"value": -1,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 2,
							"range": [0, 5]
						}
					},
					"osc2": {
						"range": {
							"value": 0,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 0,
							"range": [0, 5]
						}
					},
					"osc3": {
						"range": {
							"value": -1,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 0,
							"range": [0, 5]
						}
					}
				},
				"mixer": {
					"volume1": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.6,
							"range": [0, 1]
						}
					},
					"volume2": {
						"enabled": {
							"value": 0,
							"range": [0, 1]
						},
						"level": {
							"value": 0.6,
							"range": [0, 1]
						}
					},
					"volume3": {
						"enabled": {
							"value": 0,
							"range": [0, 1]
						},
						"level": {
							"value": 0.6,
							"range": [0, 1]
						}
					}
				},
				"noise": {
					"enabled": {
						"value": 0,
						"range": [0, 1]
					},
					"level": {
						"value": 0.03,
						"range": [0, 1]
					},
					"type": {
						"value": 0,
						"range": [0, 2]
					}
				},
				"envelopes": {
					"primary": {
						"attack": {
							"value": 0,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.002,
							"range": [0.002, 2]
						},
						"sustain": {
							"value": 0.96,
							"range": [0, 1]
						},
						"release": {
							"value": 0.94,
							"range": [0, 2]
						}
					},
					"filter": {
						"attack": {
							"value": 0,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.04,
							"range": [0, 2]
						},
						"sustain": {
							"value": 0.56044,
							"range": [0.001, 1]
						},
						"release": {
							"value": 0.92,
							"range": [0, 2]
						}
					}
				},
				"filter": {
					"cutoff": {
						"value": 560,
						"range": [0, 8000]
					},
					"emphasis": {
						"value": 0.4,
						"range": [0.4, 40]
					},
					"envAmount": {
						"value": 1,
						"range": [0, 1]
					}
				},
				"lfo": {
					"waveform": {
						"value": 0,
						"range": [0, 5]
					},
					"rate": {
						"value": 3,
						"range": [1, 25]
					},
					"amount": {
						"value": 0,
						"range": [0, 1]
					}
				},
				"pitch": {
					"bend": {
						"value": 0,
						"range": [-200, 200]
					}
				}
			}
		}
	},
	"Bird": {
		"daw": {
			"pitch": {
				"bend": {
					"value": 0,
					"range": [-200, 200]
				}
			},
			"modulation": {
				"rate": {
					"value": 0,
					"range": [0, 15]
				}
			},
			"delay": {
				"time": {
					"value": 370,
					"range": [0, 1000]
				},
				"feedback": {
					"value": 0.5670000000000001,
					"range": [0, 0.9]
				},
				"dry": {
					"value": 1,
					"range": [0, 1]
				},
				"wet": {
					"value": 0.4,
					"range": [0, 1]
				}
			},
			"reverb": {
				"level": {
					"value": 0.28,
					"range": [0, 1]
				}
			},
			"masterVolume": {
				"level": {
					"value": 1,
					"range": [0, 1]
				}
			}
		},
		"instruments": {
			"synth": {
				"modulation": {
					"waveform": {
						"value": 0,
						"range": [0, 5]
					},
					"portamento": {
						"value": 0.008333333333333333,
						"range": [0, 0.16666666666666666]
					},
					"rate": {
						"value": 0,
						"range": [0, 15]
					}
				},
				"oscillator": {
					"osc1": {
						"range": {
							"value": 0,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 0,
							"range": [0, 5]
						}
					},
					"osc2": {
						"range": {
							"value": 0,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 0,
							"range": [0, 5]
						}
					},
					"osc3": {
						"range": {
							"value": 2,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 0,
							"range": [0, 5]
						}
					}
				},
				"mixer": {
					"volume1": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.36,
							"range": [0, 1]
						}
					},
					"volume2": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.25,
							"range": [0, 1]
						}
					},
					"volume3": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.29,
							"range": [0, 1]
						}
					}
				},
				"noise": {
					"enabled": {
						"value": 0,
						"range": [0, 1]
					},
					"level": {
						"value": 0,
						"range": [0, 1]
					},
					"type": {
						"value": 0,
						"range": [0, 2]
					}
				},
				"envelopes": {
					"primary": {
						"attack": {
							"value": 0.5,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.5,
							"range": [0.002, 2]
						},
						"sustain": {
							"value": 0.5,
							"range": [0, 1]
						},
						"release": {
							"value": 0.1,
							"range": [0, 2]
						}
					},
					"filter": {
						"attack": {
							"value": 0.5,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.5,
							"range": [0, 2]
						},
						"sustain": {
							"value": 0.5,
							"range": [0.001, 1]
						},
						"release": {
							"value": 0.1,
							"range": [0, 2]
						}
					}
				},
				"filter": {
					"cutoff": {
						"value": 4000,
						"range": [0, 8000]
					},
					"emphasis": {
						"value": 2,
						"range": [0.4, 40]
					},
					"envAmount": {
						"value": 0,
						"range": [0, 1]
					}
				},
				"lfo": {
					"waveform": {
						"value": 5,
						"range": [0, 5]
					},
					"rate": {
						"value": 1,
						"range": [1, 25]
					},
					"amount": {
						"value": 0,
						"range": [0, 1]
					}
				},
				"pitch": {
					"bend": {
						"value": 0,
						"range": [-200, 200]
					}
				}
			}
		}
	},
	"Electronic Violin": {
		"daw": {
			"pitch": {
				"bend": {
					"value": 0,
					"range": [-200, 200]
				}
			},
			"modulation": {
				"rate": {
					"value": 0,
					"range": [0, 15]
				}
			},
			"delay": {
				"time": {
					"value": 430,
					"range": [0, 1000]
				},
				"feedback": {
					"value": 0.531,
					"range": [0, 0.9]
				},
				"dry": {
					"value": 1,
					"range": [0, 1]
				},
				"wet": {
					"value": 0.47,
					"range": [0, 1]
				}
			},
			"reverb": {
				"level": {
					"value": 0.22,
					"range": [0, 1]
				}
			},
			"masterVolume": {
				"level": {
					"value": 1,
					"range": [0, 1]
				}
			}
		},
		"instruments": {
			"synth": {
				"modulation": {
					"waveform": {
						"value": 0,
						"range": [0, 5]
					},
					"portamento": {
						"value": 0.0016666666666666666,
						"range": [0, 0.16666666666666666]
					},
					"rate": {
						"value": 0,
						"range": [0, 15]
					}
				},
				"oscillator": {
					"osc1": {
						"range": {
							"value": 0,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 3,
							"range": [0, 5]
						}
					},
					"osc2": {
						"range": {
							"value": 0,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 2,
							"range": [0, 5]
						}
					},
					"osc3": {
						"range": {
							"value": -1,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 0,
							"range": [0, 5]
						}
					}
				},
				"mixer": {
					"volume1": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.64,
							"range": [0, 1]
						}
					},
					"volume2": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.28,
							"range": [0, 1]
						}
					},
					"volume3": {
						"enabled": {
							"value": 0,
							"range": [0, 1]
						},
						"level": {
							"value": 0.6,
							"range": [0, 1]
						}
					}
				},
				"noise": {
					"enabled": {
						"value": 0,
						"range": [0, 1]
					},
					"type": {
						"value": 0,
						"range": [0, 2]
					},
					"level": {
						"value": 0.2,
						"range": [0, 1]
					}
				},
				"envelopes": {
					"primary": {
						"attack": {
							"value": 0.8,
							"range": [0, 2]
						},
						"decay": {
							"value": 1.06094,
							"range": [0.002, 2]
						},
						"sustain": {
							"value": 0.5,
							"range": [0, 1]
						},
						"release": {
							"value": 0.1,
							"range": [0, 2]
						}
					},
					"filter": {
						"attack": {
							"value": 0.5,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.5,
							"range": [0, 2]
						},
						"sustain": {
							"value": 0.5,
							"range": [0.001, 1]
						},
						"release": {
							"value": 0.1,
							"range": [0, 2]
						}
					}
				},
				"filter": {
					"cutoff": {
						"value": 5424,
						"range": [0, 8000]
					},
					"emphasis": {
						"value": 13.200000000000001,
						"range": [0.4, 40]
					},
					"envAmount": {
						"value": 0,
						"range": [0, 1]
					}
				},
				"lfo": {
					"waveform": {
						"value": 0,
						"range": [0, 5]
					},
					"rate": {
						"value": 1,
						"range": [1, 25]
					},
					"amount": {
						"value": 0,
						"range": [0, 1]
					}
				},
				"pitch": {
					"bend": {
						"value": 0,
						"range": [-200, 200]
					}
				}
			}
		}
	},
	"Hang": {
		"daw": {
			"pitch": {
				"bend": {
					"value": 0,
					"range": [-200, 200]
				}
			},
			"modulation": {
				"rate": {
					"value": 0,
					"range": [0, 15]
				}
			},
			"delay": {
				"time": {
					"value": 450,
					"range": [0, 1000]
				},
				"feedback": {
					"value": 0.387,
					"range": [0, 0.9]
				},
				"dry": {
					"value": 0.66,
					"range": [0, 1]
				},
				"wet": {
					"value": 0.42,
					"range": [0, 1]
				}
			},
			"reverb": {
				"level": {
					"value": 0.35,
					"range": [0, 1]
				}
			},
			"masterVolume": {
				"level": {
					"value": 0.84,
					"range": [0, 1]
				}
			}
		},
		"instruments": {
			"synth": {
				"modulation": {
					"waveform": {
						"value": 0,
						"range": [0, 5]
					},
					"portamento": {
						"value": 0,
						"range": [0, 0.16666666666666666]
					},
					"rate": {
						"value": 0,
						"range": [0, 15]
					}
				},
				"oscillator": {
					"osc1": {
						"range": {
							"value": 0,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 0,
							"range": [0, 5]
						}
					},
					"osc2": {
						"range": {
							"value": 0,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 0,
							"range": [0, 5]
						}
					},
					"osc3": {
						"range": {
							"value": -1,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 0,
							"range": [0, 5]
						}
					}
				},
				"mixer": {
					"volume1": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.4,
							"range": [0, 1]
						}
					},
					"volume2": {
						"enabled": {
							"value": 0,
							"range": [0, 1]
						},
						"level": {
							"value": 0.4,
							"range": [0, 1]
						}
					},
					"volume3": {
						"enabled": {
							"value": 0,
							"range": [0, 1]
						},
						"level": {
							"value": 0.4,
							"range": [0, 1]
						}
					}
				},
				"noise": {
					"enabled": {
						"value": 0,
						"range": [0, 1]
					},
					"level": {
						"value": 0.03,
						"range": [0, 1]
					},
					"type": {
						"value": 0,
						"range": [0, 2]
					}
				},
				"envelopes": {
					"primary": {
						"attack": {
							"value": 0,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.002,
							"range": [0.002, 2]
						},
						"sustain": {
							"value": 0.96,
							"range": [0, 1]
						},
						"release": {
							"value": 0.94,
							"range": [0, 2]
						}
					},
					"filter": {
						"attack": {
							"value": 0.12,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.12,
							"range": [0, 2]
						},
						"sustain": {
							"value": 0.01099,
							"range": [0.001, 1]
						},
						"release": {
							"value": 0.92,
							"range": [0, 2]
						}
					}
				},
				"filter": {
					"cutoff": {
						"value": 432,
						"range": [0, 8000]
					},
					"emphasis": {
						"value": 0.4,
						"range": [0.4, 40]
					},
					"envAmount": {
						"value": 1,
						"range": [0, 1]
					}
				},
				"lfo": {
					"waveform": {
						"value": 0,
						"range": [0, 5]
					},
					"rate": {
						"value": 3,
						"range": [1, 25]
					},
					"amount": {
						"value": 0,
						"range": [0, 1]
					}
				},
				"pitch": {
					"bend": {
						"value": 0,
						"range": [-200, 200]
					}
				}
			}
		}
	},
	"Smile like you mean it": {
		"daw": {
			"pitch": {
				"bend": {
					"value": 0,
					"range": [-200, 200]
				}
			},
			"modulation": {
				"rate": {
					"value": 4.3359375,
					"range": [0, 15]
				}
			},
			"delay": {
				"time": {
					"value": 450,
					"range": [0, 1000]
				},
				"feedback": {
					"value": 0.387,
					"range": [0, 0.9]
				},
				"dry": {
					"value": 0.66,
					"range": [0, 1]
				},
				"wet": {
					"value": 0.42,
					"range": [0, 1]
				}
			},
			"reverb": {
				"level": {
					"value": 0.35,
					"range": [0, 1]
				}
			},
			"masterVolume": {
				"level": {
					"value": 0.47,
					"range": [0, 1]
				}
			}
		},
		"instruments": {
			"synth": {
				"modulation": {
					"waveform": {
						"value": 0,
						"range": [0, 5]
					},
					"portamento": {
						"value": 0,
						"range": [0, 0.16666666666666666]
					},
					"rate": {
						"value": 4.3359375,
						"range": [0, 15]
					}
				},
				"oscillator": {
					"osc1": {
						"range": {
							"value": -1,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 2,
							"range": [0, 5]
						}
					},
					"osc2": {
						"range": {
							"value": 0,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 0,
							"range": [0, 5]
						}
					},
					"osc3": {
						"range": {
							"value": -1,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 0,
							"range": [0, 5]
						}
					}
				},
				"mixer": {
					"volume1": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.6,
							"range": [0, 1]
						}
					},
					"volume2": {
						"enabled": {
							"value": 0,
							"range": [0, 1]
						},
						"level": {
							"value": 0.6,
							"range": [0, 1]
						}
					},
					"volume3": {
						"enabled": {
							"value": 0,
							"range": [0, 1]
						},
						"level": {
							"value": 0.6,
							"range": [0, 1]
						}
					}
				},
				"noise": {
					"enabled": {
						"value": 0,
						"range": [0, 1]
					},
					"level": {
						"value": 0.03,
						"range": [0, 1]
					},
					"type": {
						"value": 0,
						"range": [0, 2]
					}
				},
				"envelopes": {
					"primary": {
						"attack": {
							"value": 0,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.002,
							"range": [0.002, 2]
						},
						"sustain": {
							"value": 0.96,
							"range": [0, 1]
						},
						"release": {
							"value": 0.94,
							"range": [0, 2]
						}
					},
					"filter": {
						"attack": {
							"value": 0,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.04,
							"range": [0, 2]
						},
						"sustain": {
							"value": 0.56044,
							"range": [0.001, 1]
						},
						"release": {
							"value": 0.92,
							"range": [0, 2]
						}
					}
				},
				"filter": {
					"cutoff": {
						"value": 560,
						"range": [0, 8000]
					},
					"emphasis": {
						"value": 0.4,
						"range": [0.4, 40]
					},
					"envAmount": {
						"value": 1,
						"range": [0, 1]
					}
				},
				"lfo": {
					"waveform": {
						"value": 0,
						"range": [0, 5]
					},
					"rate": {
						"value": 3,
						"range": [1, 25]
					},
					"amount": {
						"value": 0,
						"range": [0, 1]
					}
				},
				"pitch": {
					"bend": {
						"value": 0,
						"range": [-200, 200]
					}
				}
			}
		}
	},

	"The X-Files": {
		"daw": {
			"pitch": {
				"bend": {
					"value": 0,
					"range": [-200, 200]
				}
			},
			"modulation": {
				"rate": {
					"value": 0,
					"range": [0, 15]
				}
			},
			"delay": {
				"time": {
					"value": 500,
					"range": [0, 1000]
				},
				"feedback": {
					"value": 0.63,
					"range": [0, 0.9]
				},
				"dry": {
					"value": 0.66,
					"range": [0, 1]
				},
				"wet": {
					"value": 0.42,
					"range": [0, 1]
				}
			},
			"reverb": {
				"level": {
					"value": 0.35,
					"range": [0, 1]
				}
			},
			"masterVolume": {
				"level": {
					"value": 0.84,
					"range": [0, 1]
				}
			}
		},
		"instruments": {
			"synth": {
				"modulation": {
					"waveform": {
						"value": 0,
						"range": [0, 5]
					},
					"portamento": {
						"value": 0,
						"range": [0, 0.16666666666666666]
					},
					"rate": {
						"value": 0,
						"range": [0, 15]
					}
				},
				"oscillator": {
					"osc1": {
						"range": {
							"value": 0,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 0,
							"range": [0, 5]
						}
					},
					"osc2": {
						"range": {
							"value": 0,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 0,
							"range": [0, 5]
						}
					},
					"osc3": {
						"range": {
							"value": -1,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 0,
							"range": [0, 5]
						}
					}
				},
				"mixer": {
					"volume1": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.4,
							"range": [0, 1]
						}
					},
					"volume2": {
						"enabled": {
							"value": 0,
							"range": [0, 1]
						},
						"level": {
							"value": 0.4,
							"range": [0, 1]
						}
					},
					"volume3": {
						"enabled": {
							"value": 0,
							"range": [0, 1]
						},
						"level": {
							"value": 0.4,
							"range": [0, 1]
						}
					}
				},
				"noise": {
					"enabled": {
						"value": 0,
						"range": [0, 1]
					},
					"level": {
						"value": 0.03,
						"range": [0, 1]
					},
					"type": {
						"value": 0,
						"range": [0, 2]
					}
				},
				"envelopes": {
					"primary": {
						"attack": {
							"value": 0,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.002,
							"range": [0.002, 2]
						},
						"sustain": {
							"value": 0.96,
							"range": [0, 1]
						},
						"release": {
							"value": 0.94,
							"range": [0, 2]
						}
					},
					"filter": {
						"attack": {
							"value": 0.12,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.12,
							"range": [0, 2]
						},
						"sustain": {
							"value": 0.01099,
							"range": [0.001, 1]
						},
						"release": {
							"value": 0.92,
							"range": [0, 2]
						}
					}
				},
				"filter": {
					"cutoff": {
						"value": 432,
						"range": [0, 8000]
					},
					"emphasis": {
						"value": 0.4,
						"range": [0.4, 40]
					},
					"envAmount": {
						"value": 1,
						"range": [0, 1]
					}
				},
				"lfo": {
					"waveform": {
						"value": 0,
						"range": [0, 5]
					},
					"rate": {
						"value": 3,
						"range": [1, 25]
					},
					"amount": {
						"value": 0,
						"range": [0, 1]
					}
				},
				"pitch": {
					"bend": {
						"value": 0,
						"range": [-200, 200]
					}
				}
			}
		}
	},
	"Babylon": {
		"daw": {
			"pitch": {
				"bend": {
					"value": 0,
					"range": [-200, 200]
				}
			},
			"modulation": {
				"rate": {
					"value": 0,
					"range": [0, 15]
				}
			},
			"delay": {
				"time": {
					"value": 250,
					"range": [0, 1000]
				},
				"feedback": {
					"value": 0.36000000000000004,
					"range": [0, 0.9]
				},
				"dry": {
					"value": 1,
					"range": [0, 1]
				},
				"wet": {
					"value": 0.26,
					"range": [0, 1]
				}
			},
			"reverb": {
				"level": {
					"value": 0.12,
					"range": [0, 1]
				}
			},
			"masterVolume": {
				"level": {
					"value": 0.8,
					"range": [0, 1]
				}
			}
		},
		"instruments": {
			"synth": {
				"modulation": {
					"waveform": {
						"value": 0,
						"range": [0, 5]
					},
					"portamento": {
						"value": 0.003333333333333333,
						"range": [0, 0.16666666666666666]
					},
					"rate": {
						"value": 0,
						"range": [0, 15]
					}
				},
				"oscillator": {
					"osc1": {
						"range": {
							"value": 0,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 3,
							"range": [0, 5]
						}
					},
					"osc2": {
						"range": {
							"value": 0,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 1,
							"range": [0, 5]
						}
					},
					"osc3": {
						"range": {
							"value": -1,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 0,
							"range": [0, 5]
						}
					}
				},
				"mixer": {
					"volume1": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.6,
							"range": [0, 1]
						}
					},
					"volume2": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.6,
							"range": [0, 1]
						}
					},
					"volume3": {
						"enabled": {
							"value": 0,
							"range": [0, 1]
						},
						"level": {
							"value": 0.6,
							"range": [0, 1]
						}
					}
				},
				"noise": {
					"enabled": {
						"value": 0,
						"range": [0, 1]
					},
					"type": {
						"value": 0,
						"range": [0, 2]
					},
					"level": {
						"value": 0.2,
						"range": [0, 1]
					}
				},
				"envelopes": {
					"primary": {
						"attack": {
							"value": 0,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.002,
							"range": [0.002, 2]
						},
						"sustain": {
							"value": 1,
							"range": [0, 1]
						},
						"release": {
							"value": 0.18,
							"range": [0, 2]
						}
					},
					"filter": {
						"attack": {
							"value": 0.5,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.5,
							"range": [0, 2]
						},
						"sustain": {
							"value": 0.5,
							"range": [0.001, 1]
						},
						"release": {
							"value": 0.1,
							"range": [0, 2]
						}
					}
				},
				"filter": {
					"cutoff": {
						"value": 5616,
						"range": [0, 8000]
					},
					"emphasis": {
						"value": 2,
						"range": [0.4, 40]
					},
					"envAmount": {
						"value": 0,
						"range": [0, 1]
					}
				},
				"lfo": {
					"waveform": {
						"value": 0,
						"range": [0, 5]
					},
					"rate": {
						"value": 3,
						"range": [1, 25]
					},
					"amount": {
						"value": 0.14,
						"range": [0, 1]
					}
				},
				"pitch": {
					"bend": {
						"value": 0,
						"range": [-200, 200]
					}
				}
			}
		}
	},
	"Venga Party": {
		"daw": {
			"pitch": {
				"bend": {
					"value": 0,
					"range": [-200, 200]
				}
			},
			"modulation": {
				"rate": {
					"value": 0,
					"range": [0, 15]
				}
			},
			"delay": {
				"time": {
					"value": 380,
					"range": [0, 1000]
				},
				"feedback": {
					"value": 0.45,
					"range": [0, 0.9]
				},
				"dry": {
					"value": 1,
					"range": [0, 1]
				},
				"wet": {
					"value": 0.25,
					"range": [0, 1]
				}
			},
			"reverb": {
				"level": {
					"value": 0,
					"range": [0, 1]
				}
			},
			"masterVolume": {
				"level": {
					"value": 0.8,
					"range": [0, 1]
				}
			}
		},
		"instruments": {
			"synth": {
				"modulation": {
					"waveform": {
						"value": 0,
						"range": [0, 5]
					},
					"portamento": {
						"value": 0.003333333333333333,
						"range": [0, 0.16666666666666666]
					},
					"rate": {
						"value": 0,
						"range": [0, 15]
					}
				},
				"oscillator": {
					"osc1": {
						"range": {
							"value": -2,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 2,
							"range": [0, 5]
						}
					},
					"osc2": {
						"range": {
							"value": -2,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": -5,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 2,
							"range": [0, 5]
						}
					},
					"osc3": {
						"range": {
							"value": -1,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": -1,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 2,
							"range": [0, 5]
						}
					}
				},
				"mixer": {
					"volume1": {
						"enabled": {
							"value": 0,
							"range": [0, 1]
						},
						"level": {
							"value": 0.3,
							"range": [0, 1]
						}
					},
					"volume2": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.37,
							"range": [0, 1]
						}
					},
					"volume3": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.18,
							"range": [0, 1]
						}
					}
				},
				"noise": {
					"enabled": {
						"value": 0,
						"range": [0, 1]
					},
					"type": {
						"value": 0,
						"range": [0, 2]
					},
					"level": {
						"value": 0.2,
						"range": [0, 1]
					}
				},
				"envelopes": {
					"primary": {
						"attack": {
							"value": 0,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.02198,
							"range": [0.002, 2]
						},
						"sustain": {
							"value": 0.87,
							"range": [0, 1]
						},
						"release": {
							"value": 0.02,
							"range": [0, 2]
						}
					},
					"filter": {
						"attack": {
							"value": 0.12,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.2,
							"range": [0, 2]
						},
						"sustain": {
							"value": 0.5,
							"range": [0.001, 1]
						},
						"release": {
							"value": 0.1,
							"range": [0, 2]
						}
					}
				},
				"filter": {
					"cutoff": {
						"value": 640,
						"range": [0, 8000]
					},
					"emphasis": {
						"value": 6,
						"range": [0.4, 40]
					},
					"envAmount": {
						"value": 0,
						"range": [0, 1]
					}
				},
				"lfo": {
					"waveform": {
						"value": 0,
						"range": [0, 5]
					},
					"rate": {
						"value": 8,
						"range": [1, 25]
					},
					"amount": {
						"value": 0,
						"range": [0, 1]
					}
				},
				"pitch": {
					"bend": {
						"value": 0,
						"range": [-200, 200]
					}
				}
			}
		}
	},
	"Siren": {
		"daw": {
			"pitch": {
				"bend": {
					"value": 0,
					"range": [-200, 200]
				}
			},
			"modulation": {
				"rate": {
					"value": 0,
					"range": [0, 15]
				}
			},
			"delay": {
				"time": {
					"value": 500,
					"range": [0, 1000]
				},
				"feedback": {
					"value": 0.54,
					"range": [0, 0.9]
				},
				"dry": {
					"value": 1,
					"range": [0, 1]
				},
				"wet": {
					"value": 0,
					"range": [0, 1]
				}
			},
			"reverb": {
				"level": {
					"value": 0.29,
					"range": [0, 1]
				}
			},
			"masterVolume": {
				"level": {
					"value": 0.8,
					"range": [0, 1]
				}
			}
		},
		"instruments": {
			"synth": {
				"modulation": {
					"waveform": {
						"value": 0,
						"range": [0, 5]
					},
					"portamento": {
						"value": 0.003333333333333333,
						"range": [0, 0.16666666666666666]
					},
					"rate": {
						"value": 0,
						"range": [0, 15]
					}
				},
				"oscillator": {
					"osc1": {
						"range": {
							"value": 0,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 2,
							"range": [0, 5]
						}
					},
					"osc2": {
						"range": {
							"value": -1,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 8,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 2,
							"range": [0, 5]
						}
					},
					"osc3": {
						"range": {
							"value": -1,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": -4,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 2,
							"range": [0, 5]
						}
					}
				},
				"mixer": {
					"volume1": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.3,
							"range": [0, 1]
						}
					},
					"volume2": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.37,
							"range": [0, 1]
						}
					},
					"volume3": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.18,
							"range": [0, 1]
						}
					}
				},
				"noise": {
					"enabled": {
						"value": 0,
						"range": [0, 1]
					},
					"type": {
						"value": 0,
						"range": [0, 2]
					},
					"level": {
						"value": 0.2,
						"range": [0, 1]
					}
				},
				"envelopes": {
					"primary": {
						"attack": {
							"value": 0,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.02198,
							"range": [0.002, 2]
						},
						"sustain": {
							"value": 0.87,
							"range": [0, 1]
						},
						"release": {
							"value": 0.02,
							"range": [0, 2]
						}
					},
					"filter": {
						"attack": {
							"value": 0.12,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.2,
							"range": [0, 2]
						},
						"sustain": {
							"value": 0.5,
							"range": [0.001, 1]
						},
						"release": {
							"value": 0.1,
							"range": [0, 2]
						}
					}
				},
				"filter": {
					"cutoff": {
						"value": 4976,
						"range": [0, 8000]
					},
					"emphasis": {
						"value": 5.200000000000001,
						"range": [0.4, 40]
					},
					"envAmount": {
						"value": 0,
						"range": [0, 1]
					}
				},
				"lfo": {
					"waveform": {
						"value": 0,
						"range": [0, 5]
					},
					"rate": {
						"value": 8,
						"range": [1, 25]
					},
					"amount": {
						"value": 0,
						"range": [0, 1]
					}
				},
				"pitch": {
					"bend": {
						"value": 0,
						"range": [-200, 200]
					}
				}
			}
		}
	},
	"Ba-ba-ba-ba-ba (voice)": {
		"daw": {
			"pitch": {
				"bend": {
					"value": 0,
					"range": [-200, 200]
				}
			},
			"modulation": {
				"rate": {
					"value": 0,
					"range": [0, 15]
				}
			},
			"delay": {
				"time": {
					"value": 500,
					"range": [0, 1000]
				},
				"feedback": {
					"value": 0.54,
					"range": [0, 0.9]
				},
				"dry": {
					"value": 1,
					"range": [0, 1]
				},
				"wet": {
					"value": 0,
					"range": [0, 1]
				}
			},
			"reverb": {
				"level": {
					"value": 0.29,
					"range": [0, 1]
				}
			},
			"masterVolume": {
				"level": {
					"value": 0.8,
					"range": [0, 1]
				}
			}
		},
		"instruments": {
			"synth": {
				"modulation": {
					"waveform": {
						"value": 0,
						"range": [0, 5]
					},
					"portamento": {
						"value": 0.003333333333333333,
						"range": [0, 0.16666666666666666]
					},
					"rate": {
						"value": 0,
						"range": [0, 15]
					}
				},
				"oscillator": {
					"osc1": {
						"range": {
							"value": 0,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 0,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 2,
							"range": [0, 5]
						}
					},
					"osc2": {
						"range": {
							"value": -1,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": 8,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 2,
							"range": [0, 5]
						}
					},
					"osc3": {
						"range": {
							"value": -1,
							"range": [-4, 2]
						},
						"fineDetune": {
							"value": -4,
							"range": [-8, 8]
						},
						"waveform": {
							"value": 2,
							"range": [0, 5]
						}
					}
				},
				"mixer": {
					"volume1": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.3,
							"range": [0, 1]
						}
					},
					"volume2": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.37,
							"range": [0, 1]
						}
					},
					"volume3": {
						"enabled": {
							"value": 1,
							"range": [0, 1]
						},
						"level": {
							"value": 0.18,
							"range": [0, 1]
						}
					}
				},
				"noise": {
					"enabled": {
						"value": 0,
						"range": [0, 1]
					},
					"type": {
						"value": 0,
						"range": [0, 2]
					},
					"level": {
						"value": 0.2,
						"range": [0, 1]
					}
				},
				"envelopes": {
					"primary": {
						"attack": {
							"value": 0,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.02198,
							"range": [0.002, 2]
						},
						"sustain": {
							"value": 0.87,
							"range": [0, 1]
						},
						"release": {
							"value": 0.02,
							"range": [0, 2]
						}
					},
					"filter": {
						"attack": {
							"value": 0.12,
							"range": [0, 2]
						},
						"decay": {
							"value": 0.2,
							"range": [0, 2]
						},
						"sustain": {
							"value": 0.5,
							"range": [0.001, 1]
						},
						"release": {
							"value": 0.1,
							"range": [0, 2]
						}
					}
				},
				"filter": {
					"cutoff": {
						"value": 1200,
						"range": [0, 8000]
					},
					"emphasis": {
						"value": 5.200000000000001,
						"range": [0.4, 40]
					},
					"envAmount": {
						"value": 0,
						"range": [0, 1]
					}
				},
				"lfo": {
					"waveform": {
						"value": 0,
						"range": [0, 5]
					},
					"rate": {
						"value": 8,
						"range": [1, 25]
					},
					"amount": {
						"value": 1,
						"range": [0, 1]
					}
				},
				"pitch": {
					"bend": {
						"value": 0,
						"range": [-200, 200]
					}
				}
			}
		}
	},
	"Sirens' Awakening": {
		"version": 6,
		"daw": {
			"pitch": {
				"bend": 0
			},
			"modulation": {
				"rate": 2.34375
			},
			"compressor": {
				"enabled": 1,
				"threshold": -20,
				"ratio": 6.7,
				"knee": 2,
				"attack": 0.1,
				"release": 20,
				"makeupGain": 4.1000000000000005
			},
			"delay": {
				"time": 370,
				"feedback": 0.5670000000000001,
				"dry": 1,
				"wet": 0.52
			},
			"reverb": {
				"level": 0.37
			},
			"masterVolume": {
				"level": 0.9
			}
		},
		"instruments": {
			"synth": {
				"polyphony": {
					"voiceCount": 3,
					"sustain": 0
				},
				"modulation": {
					"waveform": 3,
					"portamento": 0.034999999999999996,
					"rate": 2.34375
				},
				"oscillator": {
					"osc1": {
						"range": -2,
						"fineDetune": 0,
						"waveform": 0
					},
					"osc2": {
						"range": 1,
						"fineDetune": -337.7110694183865,
						"waveform": 2
					},
					"osc3": {
						"range": 2,
						"fineDetune": 0,
						"waveform": 0
					}
				},
				"mixer": {
					"volume1": {
						"enabled": 1,
						"level": 0.49
					},
					"volume2": {
						"enabled": 1,
						"level": 0.35
					},
					"volume3": {
						"enabled": 0,
						"level": 0.6
					}
				},
				"noise": {
					"enabled": 1,
					"level": 0,
					"type": 2
				},
				"envelopes": {
					"primary": {
						"attack": 1.2,
						"decay": 0.5,
						"sustain": 0.5,
						"release": 1.02
					},
					"filter": {
						"attack": 0,
						"decay": 0.5,
						"sustain": 0.5,
						"release": 0.1
					}
				},
				"filter": {
					"cutoff": 3360,
					"emphasis": 20,
					"envAmount": 0.29
				},
				"lfo": {
					"waveform": 0,
					"rate": 3,
					"amount": 0.12
				},
				"pitch": {
					"bend": 0
				}
			}
		}
	},
	"Long Kiss": {
		"version": 4,
		"daw": {
			"pitch": {
				"bend": 0
			},
			"modulation": {
				"rate": 0
			},
			"delay": {
				"time": 380,
				"feedback": 0.7200000000000001,
				"dry": 1,
				"wet": 1
			},
			"reverb": {
				"level": 0.75
			},
			"masterVolume": {
				"level": 0.16
			}
		},
		"instruments": {
			"synth": {
				"polyphony": {
					"voiceCount": 10,
					"sustain": 0
				},
				"modulation": {
					"waveform": 0,
					"portamento": 0.006666666666666666,
					"rate": 0
				},
				"oscillator": {
					"osc1": {
						"range": 0,
						"fineDetune": 0,
						"waveform": 0
					},
					"osc2": {
						"range": -1,
						"fineDetune": -8,
						"waveform": 2
					},
					"osc3": {
						"range": -2,
						"fineDetune": -8,
						"waveform": 1
					}
				},
				"mixer": {
					"volume1": {
						"enabled": 1,
						"level": 0.25
					},
					"volume2": {
						"enabled": 1,
						"level": 0.77
					},
					"volume3": {
						"enabled": 1,
						"level": 0.83
					}
				},
				"noise": {
					"enabled": 1,
					"level": 1,
					"type": 2
				},
				"envelopes": {
					"primary": {
						"attack": 0,
						"decay": 1.38062,
						"sustain": 0.73,
						"release": 0.92
					},
					"filter": {
						"attack": 0.14,
						"decay": 1.18,
						"sustain": 0.63037,
						"release": 0.92
					}
				},
				"filter": {
					"cutoff": 5776,
					"emphasis": 0.4,
					"envAmount": 0.88
				},
				"lfo": {
					"waveform": 0,
					"rate": 1,
					"amount": 0
				},
				"pitch": {
					"bend": 0
				}
			}
		}
	},
	"Danger Bubbles": {
		"version": 6,
		"daw": {
			"pitch": {
				"bend": 0
			},
			"modulation": {
				"rate": 15
			},
			"compressor": {
				"enabled": 1,
				"threshold": -20,
				"ratio": 3,
				"knee": 2,
				"attack": 0.1,
				"release": 20,
				"makeupGain": 0
			},
			"delay": {
				"time": 240,
				"feedback": 0.801,
				"dry": 0.92,
				"wet": 0.16
			},
			"reverb": {
				"level": 0
			},
			"masterVolume": {
				"level": 1
			}
		},
		"instruments": {
			"synth": {
				"polyphony": {
					"voiceCount": 4,
					"sustain": 0
				},
				"modulation": {
					"waveform": 0,
					"portamento": 0.05333333333333333,
					"rate": 15
				},
				"oscillator": {
					"osc1": {
						"range": -2,
						"fineDetune": 0,
						"waveform": 3
					},
					"osc2": {
						"range": -3,
						"fineDetune": 373.7335834896812,
						"waveform": 3
					},
					"osc3": {
						"range": -4,
						"fineDetune": 598.8742964352721,
						"waveform": 3
					}
				},
				"mixer": {
					"volume1": {
						"enabled": 1,
						"level": 0.12
					},
					"volume2": {
						"enabled": 1,
						"level": 0.44
					},
					"volume3": {
						"enabled": 1,
						"level": 0.73
					}
				},
				"noise": {
					"enabled": 1,
					"level": 0.03,
					"type": 1
				},
				"envelopes": {
					"primary": {
						"attack": 2,
						"decay": 1.1608399999999999,
						"sustain": 0.73,
						"release": 1.34
					},
					"filter": {
						"attack": 1.64,
						"decay": 1.76,
						"sustain": 0.8201799999999999,
						"release": 1.72
					}
				},
				"filter": {
					"cutoff": 240,
					"emphasis": 33.2,
					"envAmount": 0.2
				},
				"lfo": {
					"waveform": 0,
					"rate": 7,
					"amount": 0.25
				},
				"pitch": {
					"bend": 0
				}
			}
		}
	},
	"Syo - demo": {
		"version": 6,
		"daw": {
			"pitch": {
				"bend": 0
			},
			"modulation": {
				"rate": 0
			},
			"compressor": {
				"enabled": 1,
				"threshold": -20,
				"ratio": 3,
				"knee": 2,
				"attack": 0.1,
				"release": 20,
				"makeupGain": 0
			},
			"delay": {
				"time": 1000,
				"feedback": 0.9,
				"dry": 1,
				"wet": 0.72
			},
			"reverb": {
				"level": 0.22
			},
			"masterVolume": {
				"level": 0.3
			}
		},
		"instruments": {
			"synth": {
				"polyphony": {
					"voiceCount": 10,
					"sustain": 1
				},
				"modulation": {
					"waveform": 2,
					"portamento": 0.048333333333333325,
					"rate": 0
				},
				"oscillator": {
					"osc1": {
						"range": 0,
						"fineDetune": 0,
						"waveform": 0
					},
					"osc2": {
						"range": -3,
						"fineDetune": -100,
						"waveform": 0
					},
					"osc3": {
						"range": -1,
						"fineDetune": 600,
						"waveform": 0
					}
				},
				"mixer": {
					"volume1": {
						"enabled": 0,
						"level": 0.2
					},
					"volume2": {
						"enabled": 1,
						"level": 0.16
					},
					"volume3": {
						"enabled": 1,
						"level": 0.08
					}
				},
				"noise": {
					"enabled": 0,
					"level": 0.17,
					"type": 0
				},
				"envelopes": {
					"primary": {
						"attack": 2,
						"decay": 0.002,
						"sustain": 0.36,
						"release": 2
					},
					"filter": {
						"attack": 2,
						"decay": 1.44,
						"sustain": 1,
						"release": 0.02
					}
				},
				"filter": {
					"cutoff": 1744,
					"emphasis": 25.2,
					"envAmount": 1
				},
				"lfo": {
					"waveform": 1,
					"rate": 6,
					"amount": 0.61
				},
				"pitch": {
					"bend": 0
				}
			}
		}
	},
	"Whale song - Synthakt": {
		"version": 6,
		"daw": {
			"pitch": {
				"bend": 0
			},
			"modulation": {
				"rate": 0
			},
			"compressor": {
				"enabled": 1,
				"threshold": -20,
				"ratio": 3,
				"knee": 2,
				"attack": 0.1,
				"release": 20,
				"makeupGain": 0
			},
			"delay": {
				"time": 610,
				"feedback": 0.423,
				"dry": 0.56,
				"wet": 0.56
			},
			"reverb": {
				"level": 0.89
			},
			"masterVolume": {
				"level": 1
			}
		},
		"instruments": {
			"synth": {
				"polyphony": {
					"voiceCount": 7,
					"sustain": 0
				},
				"modulation": {
					"waveform": 0,
					"portamento": 0.045,
					"rate": 0
				},
				"oscillator": {
					"osc1": {
						"range": 1,
						"fineDetune": 0,
						"waveform": 1
					},
					"osc2": {
						"range": 0,
						"fineDetune": -675.9224515322076,
						"waveform": 5
					},
					"osc3": {
						"range": -1,
						"fineDetune": -50.53158223889932,
						"waveform": 1
					}
				},
				"mixer": {
					"volume1": {
						"enabled": 1,
						"level": 0.3
					},
					"volume2": {
						"enabled": 1,
						"level": 0.37
					},
					"volume3": {
						"enabled": 1,
						"level": 0.18
					}
				},
				"noise": {
					"enabled": 1,
					"level": 0.2,
					"type": 0
				},
				"envelopes": {
					"primary": {
						"attack": 0,
						"decay": 2,
						"sustain": 1,
						"release": 0.96
					},
					"filter": {
						"attack": 0.12,
						"decay": 1.56,
						"sustain": 0.5,
						"release": 0.94
					}
				},
				"filter": {
					"cutoff": 4624,
					"emphasis": 20.799999999999997,
					"envAmount": 0.86
				},
				"lfo": {
					"waveform": 2,
					"rate": 1,
					"amount": 0.43
				},
				"pitch": {
					"bend": 0
				}
			}
		}
	},
	"AC1": {
		"version": 5,
		"daw": {
			"pitch": {
				"bend": 0
			},
			"modulation": {
				"rate": 0
			},
			"delay": {
				"time": 80,
				"feedback": 0.774,
				"dry": 0.18,
				"wet": 0.99
			},
			"reverb": {
				"level": 0.82
			},
			"masterVolume": {
				"level": 0.84
			}
		},
		"instruments": {
			"synth": {
				"polyphony": {
					"voiceCount": 10,
					"sustain": 0
				},
				"modulation": {
					"waveform": 0,
					"portamento": 0,
					"rate": 0
				},
				"oscillator": {
					"osc1": {
						"range": 0,
						"fineDetune": 0,
						"waveform": 2
					},
					"osc2": {
						"range": 1,
						"fineDetune": 336.71044402751727,
						"waveform": 2
					},
					"osc3": {
						"range": -1,
						"fineDetune": -487.8048780487805,
						"waveform": 0
					}
				},
				"mixer": {
					"volume1": {
						"enabled": 1,
						"level": 0.4
					},
					"volume2": {
						"enabled": 1,
						"level": 0.25
					},
					"volume3": {
						"enabled": 1,
						"level": 0.4
					}
				},
				"noise": {
					"enabled": 0,
					"level": 0.03,
					"type": 0
				},
				"envelopes": {
					"primary": {
						"attack": 0,
						"decay": 0.002,
						"sustain": 0.53,
						"release": 0.02
					},
					"filter": {
						"attack": 0.12,
						"decay": 0.12,
						"sustain": 0.01099,
						"release": 0.92
					}
				},
				"filter": {
					"cutoff": 8000,
					"emphasis": 0.4,
					"envAmount": 0
				},
				"lfo": {
					"waveform": 0,
					"rate": 3,
					"amount": 0
				},
				"pitch": {
					"bend": 0
				}
			}
		}
	},
	"AC2": {
		"version": 5,
		"daw": {
			"pitch": {
				"bend": 0
			},
			"modulation": {
				"rate": 5.625
			},
			"delay": {
				"time": 430,
				"feedback": 0.774,
				"dry": 0.18,
				"wet": 1
			},
			"reverb": {
				"level": 0.86
			},
			"masterVolume": {
				"level": 0.95
			}
		},
		"instruments": {
			"synth": {
				"polyphony": {
					"voiceCount": 6,
					"sustain": 0
				},
				"modulation": {
					"waveform": 0,
					"portamento": 0.07833333333333332,
					"rate": 5.625
				},
				"oscillator": {
					"osc1": {
						"range": 1,
						"fineDetune": 0,
						"waveform": 2
					},
					"osc2": {
						"range": 1,
						"fineDetune": -800,
						"waveform": 2
					},
					"osc3": {
						"range": -1,
						"fineDetune": 800,
						"waveform": 0
					}
				},
				"mixer": {
					"volume1": {
						"enabled": 1,
						"level": 0
					},
					"volume2": {
						"enabled": 1,
						"level": 0
					},
					"volume3": {
						"enabled": 1,
						"level": 0.12
					}
				},
				"noise": {
					"enabled": 1,
					"level": 0.53,
					"type": 0
				},
				"envelopes": {
					"primary": {
						"attack": 0,
						"decay": 0.002,
						"sustain": 0.56,
						"release": 0.02
					},
					"filter": {
						"attack": 0,
						"decay": 0.12,
						"sustain": 0.01099,
						"release": 0.92
					}
				},
				"filter": {
					"cutoff": 4416,
					"emphasis": 17.6,
					"envAmount": 0.62
				},
				"lfo": {
					"waveform": 4,
					"rate": 23,
					"amount": 0.35
				},
				"pitch": {
					"bend": 0
				}
			}
		}
	},
	"Ghosts": {
		"version": 6,
		"daw": {
			"pitch": {
				"bend": 0
			},
			"modulation": {
				"rate": 5.625
			},
			"compressor": {
				"threshold": -20,
				"ratio": 3,
				"knee": 2,
				"attack": 0.1,
				"release": 20,
				"makeupGain": 0,
				"enabled": 0
			},
			"delay": {
				"time": 430,
				"feedback": 0.774,
				"dry": 0.18,
				"wet": 1
			},
			"reverb": {
				"level": 0.86
			},
			"masterVolume": {
				"level": 0.95
			}
		},
		"instruments": {
			"synth": {
				"polyphony": {
					"voiceCount": 6,
					"sustain": 0
				},
				"modulation": {
					"waveform": 0,
					"portamento": 0.07833333333333332,
					"rate": 5.625
				},
				"oscillator": {
					"osc1": {
						"range": 1,
						"fineDetune": 0,
						"waveform": 2
					},
					"osc2": {
						"range": 1,
						"fineDetune": -800,
						"waveform": 2
					},
					"osc3": {
						"range": -1,
						"fineDetune": 800,
						"waveform": 0
					}
				},
				"mixer": {
					"volume1": {
						"enabled": 1,
						"level": 0
					},
					"volume2": {
						"enabled": 1,
						"level": 0
					},
					"volume3": {
						"enabled": 1,
						"level": 0.12
					}
				},
				"noise": {
					"enabled": 0,
					"level": 0.53,
					"type": 0
				},
				"envelopes": {
					"primary": {
						"attack": 0,
						"decay": 0.002,
						"sustain": 0.56,
						"release": 0.02
					},
					"filter": {
						"attack": 0,
						"decay": 0.12,
						"sustain": 0.01099,
						"release": 0.92
					}
				},
				"filter": {
					"cutoff": 4416,
					"emphasis": 17.6,
					"envAmount": 0.62
				},
				"lfo": {
					"waveform": 4,
					"rate": 23,
					"amount": 0.35
				},
				"pitch": {
					"bend": 0
				}
			}
		}
	},
	"BB8": {
		"version": 6,
		"daw": {
			"pitch": {
				"bend": 0
			},
			"modulation": {
				"rate": 0
			},
			"compressor": {
				"threshold": -20,
				"ratio": 3,
				"knee": 2,
				"attack": 0.1,
				"release": 20,
				"makeupGain": 0,
				"enabled": 0
			},
			"delay": {
				"time": 570,
				"feedback": 0.45,
				"dry": 1,
				"wet": 0
			},
			"reverb": {
				"level": 0.15
			},
			"masterVolume": {
				"level": 0.8
			}
		},
		"instruments": {
			"synth": {
				"polyphony": {
					"voiceCount": 1,
					"sustain": 0
				},
				"modulation": {
					"waveform": 5,
					"portamento": 0.006666666666666666,
					"rate": 0
				},
				"oscillator": {
					"osc1": {
						"range": -1,
						"fineDetune": 0,
						"waveform": 0
					},
					"osc2": {
						"range": -2,
						"fineDetune": 424.7654784240151,
						"waveform": 1
					},
					"osc3": {
						"range": 1,
						"fineDetune": 800,
						"waveform": 1
					}
				},
				"mixer": {
					"volume1": {
						"enabled": 1,
						"level": 0.2
					},
					"volume2": {
						"enabled": 1,
						"level": 0.25
					},
					"volume3": {
						"enabled": 1,
						"level": 0.77
					}
				},
				"noise": {
					"enabled": 1,
					"level": 0.14,
					"type": 1
				},
				"envelopes": {
					"primary": {
						"attack": 0,
						"decay": 0.002,
						"sustain": 0.73,
						"release": 0.02
					},
					"filter": {
						"attack": 0.14,
						"decay": 0.2,
						"sustain": 0.16084,
						"release": 0.48
					}
				},
				"filter": {
					"cutoff": 560,
					"emphasis": 18.8,
					"envAmount": 0
				},
				"lfo": {
					"waveform": 0,
					"rate": 6,
					"amount": 0
				},
				"pitch": {
					"bend": 0
				}
			}
		}
	},
    "Wow - Cats": {
        "version": 6,
        "daw": {
            "pitch": {
                "bend": 0
            },
            "modulation": {
                "rate": 0.234375
            },
            "compressor": {
                "enabled": 1,
                "threshold": -26.5,
                "ratio": 3.9000000000000004,
                "knee": 12.9,
                "attack": 859.3100000000001,
                "release": 249.1,
                "makeupGain": 0.5
            },
            "delay": {
                "time": 660,
                "feedback": 0.47700000000000004,
                "dry": 1,
                "wet": 0
            },
            "reverb": {
                "level": 0.09
            },
            "masterVolume": {
                "level": 0.52
            }
        },
        "instruments": {
            "synth": {
                "polyphony": {
                    "voiceCount": 7,
                    "sustain": 0
                },
                "modulation": {
                    "waveform": 0,
                    "portamento": 0.065,
                    "rate": 0.234375
                },
                "oscillator": {
                    "osc1": {
                        "range": 1,
                        "fineDetune": 0,
                        "waveform": 4
                    },
                    "osc2": {
                        "range": -1,
                        "fineDetune": 800,
                        "waveform": 2
                    },
                    "osc3": {
                        "range": -3,
                        "fineDetune": -87.55472170106316,
                        "waveform": 2
                    }
                },
                "mixer": {
                    "volume1": {
                        "enabled": 1,
                        "level": 0.17
                    },
                    "volume2": {
                        "enabled": 1,
                        "level": 0.44
                    },
                    "volume3": {
                        "enabled": 0,
                        "level": 0.75
                    }
                },
                "noise": {
                    "enabled": 1,
                    "level": 0,
                    "type": 1
                },
                "envelopes": {
                    "primary": {
                        "attack": 0.96,
                        "decay": 0.74126,
                        "sustain": 0.27,
                        "release": 1.04
                    },
                    "filter": {
                        "attack": 1,
                        "decay": 0.56,
                        "sustain": 0.66034,
                        "release": 1.42
                    }
                },
                "filter": {
                    "cutoff": 3200,
                    "emphasis": 23.200000000000003,
                    "envAmount": 0.57
                },
                "lfo": {
                    "waveform": 1,
                    "rate": 3,
                    "amount": 0
                },
                "pitch": {
                    "bend": 0
                }
            }
        }
    },
	"Outer Space": {
		"version": 6,
		"daw": {
			"pitch": {
				"bend": 0
			},
			"modulation": {
				"rate": 0
			},
			"compressor": {
				"enabled": 1,
				"threshold": -20,
				"ratio": 3,
				"knee": 2,
				"attack": 0.1,
				"release": 20,
				"makeupGain": 0
			},
			"delay": {
				"time": 310,
				"feedback": 0.36000000000000004,
				"dry": 0.65,
				"wet": 0.57
			},
			"reverb": {
				"level": 0.49
			},
			"masterVolume": {
				"level": 0.8031496062992126
			}
		},
		"instruments": {
			"synth": {
				"polyphony": {
					"voiceCount": 1,
					"sustain": 0
				},
				"modulation": {
					"waveform": 0,
					"portamento": 0,
					"rate": 0
				},
				"oscillator": {
					"osc1": {
						"range": 0,
						"fineDetune": 0,
						"waveform": 1
					},
					"osc2": {
						"range": 1,
						"fineDetune": 200,
						"waveform": 2
					},
					"osc3": {
						"range": -2,
						"fineDetune": 300,
						"waveform": 3
					}
				},
				"mixer": {
					"volume1": {
						"enabled": 1,
						"level": 0.6
					},
					"volume2": {
						"enabled": 1,
						"level": 0.79
					},
					"volume3": {
						"enabled": 1,
						"level": 0.6
					}
				},
				"noise": {
					"enabled": 1,
					"level": 0.84,
					"type": 2
				},
				"envelopes": {
					"primary": {
						"attack": 0,
						"decay": 0.5,
						"sustain": 0.5,
						"release": 0.1
					},
					"filter": {
						"attack": 0,
						"decay": 0.5,
						"sustain": 0.5,
						"release": 0.1
					}
				},
				"filter": {
					"cutoff": 5664,
					"emphasis": 0.4,
					"envAmount": 1
				},
				"lfo": {
					"waveform": 1,
					"rate": 5,
					"amount": 1
				},
				"pitch": {
					"bend": 0
				}
			}
		}
	},
	"Flint Kids Shuttledron": {
		"version": 6,
		"daw": {
			"pitch": {
				"bend": 0
			},
			"modulation": {
				"rate": 7.03125
			},
			"compressor": {
				"enabled": 1,
				"threshold": -20,
				"ratio": 3,
				"knee": 2,
				"attack": 0.1,
				"release": 20,
				"makeupGain": 0
			},
			"delay": {
				"time": 70,
				"feedback": 0.684,
				"dry": 0.15,
				"wet": 0.92
			},
			"reverb": {
				"level": 1
			},
			"masterVolume": {
				"level": 0.67
			}
		},
		"instruments": {
			"synth": {
				"polyphony": {
					"voiceCount": 10,
					"sustain": 0
				},
				"modulation": {
					"waveform": 5,
					"portamento": 0.039999999999999994,
					"rate": 7.03125
				},
				"oscillator": {
					"osc1": {
						"range": -3,
						"fineDetune": 0,
						"waveform": 5
					},
					"osc2": {
						"range": -3,
						"fineDetune": -63.539712320200124,
						"waveform": 3
					},
					"osc3": {
						"range": -4,
						"fineDetune": -800,
						"waveform": 5
					}
				},
				"mixer": {
					"volume1": {
						"enabled": 1,
						"level": 1
					},
					"volume2": {
						"enabled": 1,
						"level": 0.93
					},
					"volume3": {
						"enabled": 1,
						"level": 0.38
					}
				},
				"noise": {
					"enabled": 1,
					"level": 0,
					"type": 0
				},
				"envelopes": {
					"primary": {
						"attack": 2,
						"decay": 2,
						"sustain": 1,
						"release": 1.38
					},
					"filter": {
						"attack": 2,
						"decay": 1.02,
						"sustain": 0.001,
						"release": 0.82
					}
				},
				"filter": {
					"cutoff": 7744,
					"emphasis": 9.200000000000001,
					"envAmount": 1
				},
				"lfo": {
					"waveform": 5,
					"rate": 25,
					"amount": 1
				},
				"pitch": {
					"bend": 0
				}
			}
		}
	}

};