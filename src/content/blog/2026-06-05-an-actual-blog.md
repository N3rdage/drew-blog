---
title: "Working with agents: The story so far"
description: "It's not about should I, or how, but when."
pubDate: "Jun 04 2026"
heroImage: "../../assets/hero-images/agents-story-hero.png"
---

So I am (after this) three blogs deep into my new blog website (a pending TODO since I pulled down my last [BBS](https://en.wikipedia.org/wiki/Bulletin_board_system) in 19.. let's not go there). One thing I would not have expected is that this is the first entry that I have actually written.

I created a repo for my blog posts, got Claude to create a small 'hello world' post so we could test the config and deployment. Worked a treat, my next chat (a few weeks later) was "I think it might be useful to get my blog up and running with a post...". A few minutes (and a handful of credits) later I have successfully written [this](/blog/agentic-coding-workflows/) blog post about my experience, the only catch is **it isn't mine**. Don't get me wrong, it ain't bad (although I think Bonsai Claude is a better blogger) but it isn't mine. Does that matter? I would say in most scenarios not really, but for a blog, that I will claim as my content, I think yes, and I believe the same translates to engineering.

I have been using a few agents as an 'up skill' and been trialing a bit of a hands-off "vibe coding" approach on two github projects. The outcome has been surprising as I have found working with the agent (Claude Code in this instance) to actually depend in part on how I work with it. In the [first repo](https://github.com/N3rdage/bonsaiGame/blob/main/blog/2026-04-23-01-upside-down-tree.md) I have been a bit flippant, and used a lot of emoji and (older) cultural references. The [second one](https://github.com/N3rdage/the-library/blob/main/blog/2026-05-08-01-i-blamed-the-cold-start-the-trace-disagreed.md) was a more formal "let's engineer this thing" approach, and I believe it shows in the agent's interaction back to me (which you can't see), and its blog posts, linked above.

It wasn't long into the experiment however when I started creating some very specific, and cross-project rules. One very specific one was:
:::note[The rule]
I don't care about `plan mode` or `edit mode`. You will not make changes without a bit of a chat first!
:::
This has now carried over into any chat that has extensive tool use, I really do not appreciate the "oh, and one more thing" thought, to only realise my apprentice has already started down a 5 minute tooling rabbit-hole. And for some reason interrupting it feels rude, the kind of thing that doesn't happen for me with 'umans.

I am not an engineer for the purpose of remembering all the syntactic sugar that is available in my current language of choice, I strongly suspect I would be unable to even write a simple app in Fortran or Clipper anymore, and it doesn't matter. What makes me an engineer is delivering software, and my role in the process is to make sure the design and code meets requirements, follows proper patterns, and not just works but meets the users' needs (including the non-functional stuff they might not even be aware of). Can an agent do "all the things" today... Eh, not convinced. Can it help me do them all better than I could by myself? Hell yeah!

My agents are not principal engineers, at times they are not even seniors, but they are well read, know my language's syntax better than I do, and given guidance and review can actually write some decent code. Do they write bugs, sure they do, which is annoying as us 'umans don't do that kind of thing. But with a bit of control and careful guardrails they are a VERY useful tool, and here to stay.

LinkedIn has been a rich source of ~information~ opinions on how the world is going to end, or possibly how all of us will be out of a job, or [insert other extreme view here] due to the move of everything towards AI and agents. And unluckily for the future safety of humanity this is the first time we have had to face this kind of earth-shattering event ever (luckily someone had the forethought to coin the phrase "technopanic" before anything like this had ever happened[^pessimists])

[^pessimists]: [The Pessimists archive](https://pessimistsarchive.org/)

> [_Technopanic_](https://www.literacyworldwide.org/blog/literacy-now/2019/06/14/addressing-technopanic-in-the-age-of-screentime) (or techno-panic) is a [moral panic](https://en.wikipedia.org/wiki/Moral_panic) focused on a new technology, platform, or media medium. Driven by fear, it often leads to demands for immediate, restrictive regulations. These panics are cyclical and typically fixate on the perceived negative impacts the technology will have on vulnerable groups, particularly the young.

Oh, wait... this is not new, people, did you know that
[**after the introduction of the printing press**](https://connectsafely.org/they-built-what/) a group of scribes petitioned the Republic of Genoa in 1474 to outlaw the invention, essentially the original "this will destroy our profession" panic. (The monk Trithemius also wrote a treatise praising handwriting over print - which he then had printed.)

But I digress (and therefore [link to other examples below](#the-trailing-humourous-aside)).

To summarise, it doesn't matter what you call it (AI/LLMs/Agents) but the new automation tooling and assistance "agents" are here to stay. And refusing to use them is probably going to be detrimental to your career, and to be honest your enjoyment of technology going forward. My inane ramblings in this blog post are about my emerging preferences on when.

I have a feeling blogs should be short and bite sized, so I will defer my "why we still need graduates" `<rant/>` till next time.

## The trailing humourous aside...

:::aside[**Trains**]
The all-timer. When the Stockton–Darlington line opened in 1825, people genuinely feared the human body couldn't survive 30 mph and might melt.[^trains-tr] The Lancet fretted that speeds of 20 mph would suffocate passengers via "destruction of the atmosphere" in tunnels. And the much-repeated claim that women's uteruses would fly out of their bodies at speed (popularly attributed to anthropologist Genevieve Bell - treat it as the colourful-but-shaky version of the story).[^trains-ifl][^trains-mf]
:::

[^trains-tr]: [TechRadar](https://www.techradar.com/news/world-of-tech/12-technologies-that-scared-the-world-senseless-1249053)
[^trains-ifl]: [IFLScience](https://www.iflscience.com/people-once-believed-that-womens-uteruses-would-fly-out-on-speeding-trains-61343)
[^trains-mf]: [Mental Floss](https://www.mentalfloss.com/article/67806/early-trains-were-thought-make-womens-uteruses-fly-out)

:::aside[**Recorded music**]
In 1906 the "March King," John Philip Sousa, published "The Menace of Mechanical Music," warning that the phonograph and player piano were a "substitute for human skill, intelligence and soul" that would end amateur music-making in America entirely. The delicious hypocrisy: Sousa's own band was one of the world's first recording stars.[^smithsonian]
:::

[^smithsonian]: [The Mechanical Musical Menace](https://www.smithsonianmag.com/smart-news/john-philip-sousa-feared-menace-mechanical-music-180967063/)

:::aside[**The danger of becoming glass**]
Glass Delusion[^glass] was a real early-modern affliction where people became convinced they were physically made of glass. King Charles VI of France was so sure he'd shatter that he had clothes reinforced with iron rods and refused to let anyone touch him; Princess Alexandra of Bavaria believed she'd swallowed a glass grand piano as a child. It cropped up in medical records right around the time lenses were bringing the world into new focus and so is arguably a panic adjacent to glass technology. There's also folklore that a window was a portal between the living and the dead, and staring into dark glass at night could let evil in or drain your "life energy."
:::

[^glass]: [The Public Domain Review — *The Glass Delusion and its History*](https://publicdomainreview.org/essay/fear-and-fragility-the-glass-delusion-and-its-history/)

:::aside[**Writing itself**]
It was argued by Socrates (via Plato's Phaedrus) that writing would wreck human memory. The oldest panic in my list, and one we potentially wouldn't have a record of if someone hadn't written it down ¯\\(ツ)/¯. The quote[^writing] "No written instructions for an art can yield results clear or certain, Socrates states, but rather can only remind those that already know what writing is about. Furthermore, writings are silent; they cannot speak, answer questions, or come to their own defense." sounds suspiciously like he was talking about requirement specs though, so he might have had a point.
:::

[^writing]: [Plato, *Phaedrus* — Wikipedia](<https://en.wikipedia.org/wiki/Phaedrus_(dialogue)#Discussion_of_rhetoric_and_writing_(257c%E2%80%93279c)>)
