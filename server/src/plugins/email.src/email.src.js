"use strict";

import nodemailer from "nodemailer";
import hbs from 'handlebars';
import serives from 'nodemailer/lib/well-known/services.json';

// Services with a headquaters in a country which merciless destroyed my city and killed my friends with their shitty fu*ng missiles will never be in this list. rusia deservs the Hague Tribunal instead of doing any kind of business in this world
const servicesList = Object.keys(serives).filter(s => !['Yandex', 'Mail.ru'].includes(s))

export default {
    id: 'email-notifications',
    name: 'Notifications via email providers',
    description: 'Get alerts to defined E-mail addresses using various email providers',
    iconUrlOrBase64: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQ2MiIgaGVpZ2h0PSIxNDY0IiB2aWV3Qm94PSIwIDAgMTQ2MiAxNDY0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTM0Ni43NjMgMTI4Ny4yOUMzNDEuNTg3IDEzMDcuMDEgMzMzLjE5OCAxMzI2LjI0IDMyMS44MzMgMTM0NC40NUMzMTQuNTc2IDEzNTYuMDggMzA2LjQwMyAxMzY2Ljc5IDI5Ny40MzIgMTM3Ni40OEMzMDcuNjczIDEzMzQuNjkgMzAwLjc0MSAxMjgzLjQ5IDI3NS42MTkgMTIzNS40OEMyNzMuODUzIDEyMzIuMSAyNjkuNzcyIDEyMzAuOTggMjY2LjU0MyAxMjMzTDE4OC4zMDkgMTI4MS45NUMxODUuMzE0IDEyODMuODIgMTg0LjQwMiAxMjg3Ljc3IDE4Ni4yNzMgMTI5MC43N0wxOTcuNzQ0IDEzMDkuMTVDMTk5LjYxNiAxMzEyLjE1IDIwMy41NjIgMTMxMy4wNiAyMDYuNTU4IDEzMTEuMTlMMjU3LjI2MyAxMjc5LjQ3QzI1OC45NjIgMTI4NC4zNCAyNjAuNDg2IDEyODkuMjUgMjYxLjc4MyAxMjk0LjE5QzI2Ni42NjMgMTMxMi43NyAyNjguNDggMTMzMC45IDI2Ny4xODQgMTM0OC4wN0MyNjQuNzc1IDEzODAuMDUgMjUxLjc3NCAxNDA0Ljk2IDIzMC41NzMgMTQxOC4yM0MyMTkuOTg2IDE0MjQuODUgMjA3LjY4NSAxNDI4LjM2IDE5NC4zMTcgMTQyOC43NEMxOTQuMDI2IDE0MjguNzQgMTkzLjczMSAxNDI4Ljc1IDE5My40NDEgMTQyOC43NEMxOTMuMTkxIDE0MjguNzQgMTkyLjkzOSAxNDI4Ljc0IDE5Mi42ODkgMTQyOC43NEMxNzkuMzE5IDE0MjguMzYgMTY3LjAxNyAxNDI0Ljg1IDE1Ni40MjYgMTQxOC4yM0MxMzUuMjI4IDE0MDQuOTYgMTIyLjIyNSAxMzgwLjA1IDExOS44MTUgMTM0OC4wN0MxMTguNTIxIDEzMzAuOSAxMjAuMzM4IDEzMTIuNzcgMTI1LjIxNiAxMjk0LjE5QzEzMC4zOTQgMTI3NC40OCAxMzguNzggMTI1NS4yNSAxNTAuMTQ4IDEyMzcuMDRDMTYxLjUxMiAxMjE4LjgyIDE3NS4wOTcgMTIwMi44NSAxOTAuNTI4IDExODkuNTRDMjA1LjA2NCAxMTc3LjAxIDIyMC41NDEgMTE2Ny40MyAyMzYuNTI3IDExNjEuMDZDMjY2LjI4OSAxMTQ5LjIxIDI5NC4zNTMgMTE0OS45OSAzMTUuNTUzIDExNjMuMjZDMzM2Ljc1MiAxMTc2LjUyIDM0OS43NTUgMTIwMS40MyAzNTIuMTY0IDEyMzMuNDFDMzUzLjQ2IDEyNTAuNTkgMzUxLjY0MyAxMjY4LjcyIDM0Ni43NjMgMTI4Ny4yOVpNNjUuMTY3NyAxMzQ0LjQ1QzUzLjgwMTYgMTMyNi4yNCA0NS40MTM5IDEzMDcuMDEgNDAuMjM2IDEyODcuMjlDMzUuMzU4MyAxMjY4LjcyIDMzLjU0MSAxMjUwLjU5IDM0LjgzNTEgMTIzMy40MUMzNy4yNDYxIDEyMDEuNDMgNTAuMjQ3NCAxMTc2LjUyIDcxLjQ0NzcgMTE2My4yNkM5Mi42NDY0IDExNDkuOTkgMTIwLjcxMiAxMTQ5LjIxIDE1MC40NzMgMTE2MS4wNkMxNTQuOTUzIDExNjIuODUgMTU5LjM4NyAxMTY0LjkyIDE2My43NzcgMTE2Ny4yMUMxNDcuOTE0IDExODEuNiAxMzMuMzQgMTE5OC45IDEyMC45NDIgMTIxOC43NkM4OC4xMTE1IDEyNzEuMzcgNzguMTI2MyAxMzI5LjggODkuNTcyOCAxMzc2LjQ4QzgwLjYwMTMgMTM2Ni43OSA3Mi40MjY5IDEzNTYuMDggNjUuMTY3NyAxMzQ0LjQ1Wk0zMzMuODAxIDExMzQuMDJDMjkzLjU4MSAxMTA4Ljg1IDI0MC42MzUgMTExNC44MyAxOTMuNDg3IDExNDQuNTZDMTQ2LjM0NiAxMTE0Ljg0IDkzLjQxNCAxMTA4Ljg2IDUzLjE5OCAxMTM0LjAyQy0xMC4zNDA3IDExNzMuNzcgLTE4LjA1NzUgMTI3Ni4xNiAzNS45NjE5IDEzNjIuNzJDNzUuNzk0MSAxNDI2LjU0IDEzOC4wNjUgMTQ2My45MyAxOTMuNTAzIDE0NjMuMjNDMjQ4LjkzOCAxNDYzLjkyIDMxMS4yMDcgMTQyNi41NCAzNTEuMDM4IDEzNjIuNzJDNDA1LjA1NyAxMjc2LjE2IDM5Ny4zNDIgMTE3My43NyAzMzMuODAxIDExMzQuMDJaIiBmaWxsPSIjMUJEQkRCIi8+CjxwYXRoIGQ9Ik02MjMuNTk0IDgxLjI4MzJMNTIwLjczIDI0NS4wNTlMNjIzLjU5NCA0MDguODYxTDYyNS4zODggNDA3LjU4Mkw2MjQuMDcyIDgxLjYxOTZMNjIzLjU5NCA4MS4yODMyIiBmaWxsPSIjODc2OTI5Ii8+CjxwYXRoIGQ9Ik03MzguNDE5IDM3OS40MjNMNjI0LjM0MiA0MDguODYxVjgxLjI4MzJMNzM4LjQxOSAxMTAuNzE0VjM3OS40MjNaIiBmaWxsPSIjRDlBNzQxIi8+CjxwYXRoIGQ9Ik05NTYuMTA3IDEyMi42MzNMOTAwLjYzNyAxMzEuNzhMNzczLjI5NCAwLjY5NzI2Nkw3MDkuOTg2IDI4LjMzOTNMNzE4LjMzNyA0My44Njg5TDY3My41MzEgNjEuNzI4VjQ3NC43NDRMNzM4LjY2NSA1MDcuMjRMNzM5Ljc0OSA1MDYuMzkzTDczOC43NDcgODEuODI4NEw4NzYuODExIDI5MC40NjRMOTU2LjEwNyAxMjIuNjMzIiBmaWxsPSIjODc2OTI5Ii8+CjxwYXRoIGQ9Ik03NzIuOTU1IDAuNjk3MjY2TDk0Mi41IDg1LjM2NjFMODc1LjQ1NSAyMDYuODczTDc3Mi45NTUgMC42OTcyNjZaIiBmaWxsPSIjRDlBNzQxIi8+CjxwYXRoIGQ9Ik05NTYuMDYzIDEyMi4xOEw5NTYuMTA2IDM5OC42TDczOC40NDcgNTA3LjI0TDczOC40MTggMzUuMjM0NEw4NzUuNzI3IDI4My43MzNMOTU2LjA2MyAxMjIuMTgiIGZpbGw9IiNEOUE3NDEiLz4KPHBhdGggZD0iTTEyNTguMSAyMTkuMDM4QzEyNzcuNDIgMjE5LjAzOCAxMjkzLjA3IDIzNC42ODkgMTI5My4wNyAyNTMuOTk2QzEyOTMuMDcgMjczLjMwNyAxMjc3LjQyIDI4OC45NTkgMTI1OC4xIDI4OC45NTlDMTIzOC44IDI4OC45NTkgMTIyMy4xNCAyNzMuMzAzIDEyMjMuMTQgMjUzLjk5NkMxMjIzLjE0IDIzNC42ODkgMTIzOC44IDIxOS4wMzggMTI1OC4xIDIxOS4wMzhaTTExMzguOTggMjUzLjk5NkMxMTM4Ljk4IDE4OC4yMDQgMTE5Mi4zMSAxMzQuODczIDEyNTguMSAxMzQuODczQzEzMjMuOSAxMzQuODczIDEzNzcuMjMgMTg4LjIwNCAxMzc3LjIzIDI1My45OTZDMTM3Ny4yMyAyNTguMzUxIDEzNzcgMjYyLjY0NyAxMzc2LjU1IDI2Ni44NzNDMTM3NS42NCAyNzguNDg2IDEzODQuMTYgMjg3LjM0OSAxMzk1LjcgMjg3LjM0OUMxNDE1LjI5IDI4Ny4zNDkgMTQxNy4zNyAyNjIuMSAxNDE3LjM3IDI1My45OTZDMTQxNy4zNyAxNjYuMDMzIDEzNDYuMDcgOTQuNzMwMSAxMjU4LjEgOTQuNzMwMUMxMTcwLjE0IDk0LjczMDEgMTA5OC44NCAxNjYuMDMzIDEwOTguODQgMjUzLjk5NkMxMDk4Ljg0IDM0MS45NTMgMTE3MC4xNCA0MTMuMjU4IDEyNTguMSA0MTMuMjU4QzEzMDQuODIgNDEzLjI1OCAxMzQ2Ljg0IDM5My4xNTcgMTM3NS45NyAzNjEuMTI0TDE0MDguNzEgMzg4LjYxOEMxMzcxLjczIDQyOS45NjEgMTMxNy45NSA0NTYgMTI1OC4xIDQ1NkMxMTQ2LjU0IDQ1NiAxMDU2LjExIDM2NS41NTYgMTA1Ni4xMSAyNTMuOTk2QzEwNTYuMTEgMTQyLjQzNSAxMTQ2LjU0IDUyIDEyNTguMSA1MkMxMzY5LjY3IDUyIDE0NjAuMTEgMTQyLjQzNSAxNDYwLjExIDI1My45OTZDMTQ2MC4xMSAyOTguODM5IDE0MzguNzUgMzM1LjI1MyAxMzk1Ljg3IDMzNS4yNTNDMTM3Ni45OSAzMzUuMjUzIDEzNjUuNTIgMzI2LjYwNSAxMzU5LjI2IDMxNi45NTRDMTMzOC4yMiAzNTAuNjc1IDEzMDAuNzkgMzczLjEyNyAxMjU4LjEgMzczLjEyN0MxMTkyLjMxIDM3My4xMjcgMTEzOC45OCAzMTkuNzg2IDExMzguOTggMjUzLjk5NlpNMTI1OC4xIDE3Ny42MDFDMTIxNS45MSAxNzcuNjAxIDExODEuNzEgMjExLjgwMSAxMTgxLjcxIDI1My45OTZDMTE4MS43MSAyOTYuMTg5IDEyMTUuOTEgMzMwLjM5NSAxMjU4LjEgMzMwLjM5NUMxMzAwLjMgMzMwLjM5NSAxMzM0LjUxIDI5Ni4xODkgMTMzNC41MSAyNTMuOTk2QzEzMzQuNTEgMjExLjgwMSAxMzAwLjMgMTc3LjYwMSAxMjU4LjEgMTc3LjYwMVoiIGZpbGw9IiNBRjI1MkEiLz4KPHBhdGggZD0iTTkzLjY2MzIgNjA4Ljc2OEgzMTQuNTAyQzM2Ni4zOTEgNjA4Ljc2OCA0MDguMTY1IDY1MC41NDEgNDA4LjE2NSA3MDIuNDMxVjkyMy4yN0M0MDguMTY1IDk3NS4xNTkgMzY2LjM5MSAxMDE2LjkzIDMxNC41MDIgMTAxNi45M0g5My42NjMyQzQxLjc3MzggMTAxNi45MyAwIDk3NS4xNTkgMCA5MjMuMjdWNzAyLjQzMUMwIDY1MC41NDEgNDEuNzczOCA2MDguNzY4IDkzLjY2MzIgNjA4Ljc2OFY2MDguNzY4WiIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzQzOF85NSkiLz4KPHBhdGggZD0iTTg5LjQyOCA3MjQuODQxQzg3LjI3NzQgNzI0Ljg0MSA4NS4yNTE0IDcyNS4yMTIgODMuMzMzOSA3MjUuOTc1TDEyMS43NDEgNzY1LjUxNkwxNjAuNTczIDgwNS43NjVMMTYxLjI4MiA4MDYuNjE2TDE2Mi40MTYgODA3Ljc0OUwxNjMuNTUgODA4Ljg4M0wxNjUuODE3IDgxMS4yOTJMMTk5LjEyMiA4NDUuNDQ4QzE5OS42NzcgODQ1Ljc5MyAyMDEuMjg0IDg0Ny4yODEgMjAyLjUzOSA4NDcuOTA5QzIwNC4xNTcgODQ4LjcxNyAyMDUuOTA5IDg0OS40NjIgMjA3LjcxNiA4NDkuNTI3QzIwOS42NjYgODQ5LjU5NyAyMTEuNjU5IDg0OS4wMzggMjEzLjQxMyA4NDguMTg0QzIxNC43MjcgODQ3LjU0NSAyMTUuMzExIDg0Ni42MjkgMjE2LjgzOCA4NDUuNDQ4TDI1NS4zODcgODA1LjYyNEwyOTQuMzYxIDc2NS41MTZMMzMxLjkxOCA3MjYuODI1QzMyOS41MDcgNzI1LjUxOSAzMjYuODM2IDcyNC44NDEgMzIzLjk4MSA3MjQuODQxSDg5LjQyOFpNNzcuNjY0OSA3MjkuNjU5QzczLjU2OTIgNzMzLjU0IDcxLjAwMzkgNzM5LjM3NSA3MS4wMDM5IDc0NS45NThWODc1Ljc3N0M3MS4wMDM5IDg4MS4xMDcgNzIuNzE1OSA4ODUuOTUgNzUuNTM5MSA4ODkuNjY2TDgwLjkyNDYgODg0LjU2NEwxMjEuMDMyIDg0NS41OUwxNTYuNjA1IDgxMS4xNTFMMTU1Ljg5NyA4MTAuM0wxMTYuOTIyIDc3MC4xOTNMNzcuOTQ4NCA3MjkuOTQzTDc3LjY2NDkgNzI5LjY1OVpNMzM3LjAyIDczMC45MzVMMjk5LjAzOCA3NzAuMTkzTDI2MC4yMDUgODEwLjNMMjU5LjQ5NyA4MTEuMDA5TDI5Ni40ODcgODQ2Ljg2NUwzMzYuNTk1IDg4NS44MzlMMzM5LjAwNCA4ODguMTA3QzM0MS4xNjQgODg0LjY0MiAzNDIuNDA1IDg4MC4zNzQgMzQyLjQwNSA4NzUuNzc3Vjc0NS45NThDMzQyLjQwNSA3NDAuMDg4IDM0MC4zNzEgNzM0Ljc2NSAzMzcuMDIgNzMwLjkzNVpNMTYxLjE0IDgxNS44MjhMMTI1LjcwOSA4NTAuMjY3TDg1LjQ1OTggODg5LjI0MUw4MC4zNTc3IDg5NC4yMDFDODMuMDQ3NSA4OTUuOTMzIDg2LjEwODUgODk3LjAzNiA4OS40MjggODk3LjAzNkgzMjMuOTgxQzMyNy45NzIgODk3LjAzNiAzMzEuNTkyIDg5NS41IDMzNC42MTEgODkzLjA2N0wzMzIuMDYgODkwLjUxNkwyOTEuODEgODUxLjU0MkwyNTQuODIgODE1LjgyOEwyMjEuNTE1IDg1MC4xMjVDMjE5LjcxMiA4NTEuMzIgMjE4LjUwOCA4NTIuNjQ1IDIxNi43NDggODUzLjQ1OUMyMTMuOTE1IDg1NC43NjkgMjEwLjgxIDg1NS44NzcgMjA3LjY5IDg1NS44M0MyMDQuNTYxIDg1NS43ODEgMjAxLjQ5MyA4NTQuNTU3IDE5OC42ODUgODUzLjE3NkMxOTcuMjc1IDg1Mi40ODIgMTk2LjUyNCA4NTEuNzkzIDE5NC44NzEgODUwLjQwOEwxNjEuMTQgODE1LjgyOFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik04ODQuMjg1IDE0MTMuNkw4MzguOTkgMTQwOC4wM0w4NDMuOTAzIDEzNjcuODZMODg5LjIyNiAxMzczLjQxTDg4NC4yODUgMTQxMy42WiIgZmlsbD0iIzdCMDA5OSIvPgo8cGF0aCBkPSJNODUyLjM2NSAxMTYzLjE4TDg1Mi42NzkgMTM0Mi41N0w4ODUuODg2IDEzNDYuNjRMOTI5LjQ1NCAxMTcyLjkyTDg1Mi4zNjUgMTE2My4xOFoiIGZpbGw9IiM3QjAwOTkiLz4KPHBhdGggZD0iTTc1MC43NTQgMTI2Mi43N0M3NDcuMTUyIDEyNjMuMTUgNzMyLjE0NyAxMjY2LjQ5IDcyNy4xMTQgMTI2Ny41N0M3MjEuNzAyIDEyNjkuMDEgNjcyLjM3MiAxMzA3LjExIDY2OS4xMjIgMTMxNi40OEM2NjguNDAxIDEzMTkuNzMgNjY4LjA1IDEzMjQuNyA2NjguMDUgMTMyOS4zN0w2NjcuNjk5IDEzMzYuOTJDNjY3LjY5OSAxMzQyLjMzIDY2OS4xODYgMTM1MS4wMSA2NjkuOTA2IDEzNTUuNzJDNjczLjEzOCAxMzU2LjQzIDY5Ni42MDMgMTM1NS44MSA3MDAuOTM0IDEzNTYuNTNMNzAwLjQwOCAxMzY2LjE5QzY5Ni4xODggMTM2NS44OSA2NjYuMzc5IDEzNjUuOTggNjQ5LjM2OSAxMzY1Ljk4QzY0MC43MDcgMTM2NS45OCA2MTIuOTM5IDEzNjYuOTEgNjA0LjM5NyAxMzY2LjY1TDYwNi4wMTMgMTM1Ny40NkM2MTAuNjk1IDEzNTcuMDkgNjMwLjA2IDEzNTguMjkgNjM0LjMyNiAxMzUzLjhDNjM2LjQ0MSAxMzUxLjU2IDYzNS43NzYgMTM0OS4xOCA2MzUuNzc2IDEzMzYuMjJWMTMzMC4wOUM2MzUuNzc2IDEzMjcuMTkgNjM1Ljc3NiAxMzIxLjgyIDYzNS4wNTYgMTMxNi43OEM2MzMuMjQ2IDEzMTEuMzggNTg5Ljc5OCAxMjU3LjE0IDU3OC42MzMgMTI0OC40OUM1NzUuNDIgMTI0Ny40MSA1NTUuMDk1IDEyNDUuMzkgNTUwLjA2MiAxMjQ0LjNMNTQ5LjgxMyAxMjM2LjAxQzU1Mi4zMDYgMTIzNC43MyA1NzQuODkzIDEyMzYuMzEgNTk2LjgwNyAxMjM1LjVDNjExLjIyMiAxMjM0Ljk3IDY0NC4wNzggMTIzNS41IDY0OC4xMzIgMTIzNS45OEw2NDcuMDk3IDEyNDMuM0M2NDIuNzU3IDEyNDQuMzggNjIxLjk3IDEyNDQuNzcgNjE2LjU1OSAxMjQ2LjIxQzYzMC41OTUgMTI2Ny4wOCA2NTIuODIzIDEyOTMuOTcgNjU5Ljk5OCAxMzA0LjQxQzY2My45NTkgMTI5OC42NiA2OTguNzgzIDEyNzQuNzIgNjk5Ljg3MiAxMjY2LjQ1QzY5NC40NTIgMTI2NS4zNyA2NzYuNTY0IDEyNjIuNzcgNjczLjY5MyAxMjYyLjc3TDY3MS45ODQgMTI1My4zNUM2NzYuODc4IDEyNTIuNTggNzAyLjY3IDEyNTMuMzUgNzE1LjQ3OCAxMjUzLjM1QzcyNi41NDEgMTI1My4zNSA3NTAuMTcyIDEyNTMuMzUgNzU2Ljg4NiAxMjUzLjkxTDc1MC43NTQgMTI2Mi43N1pNNjUzLjU2MSAxMTY4Ljc2QzU1NS40NzMgMTE2OC43NiA0ODcgMTIyMC4xMSA0ODcgMTI5My41OEM0ODcgMTM2Ny4wNyA1NTUuNDczIDE0MTguNCA2NTMuNTYxIDE0MTguNEM3NTEuNjIyIDE0MTguNCA4MjAuMTE0IDEzNjcuMDcgODIwLjExNCAxMjkzLjU4QzgyMC4xMTQgMTIyMC4xMSA3NTEuNjIyIDExNjguNzYgNjUzLjU2MSAxMTY4Ljc2IiBmaWxsPSIjN0IwMDk5Ii8+CjxwYXRoIGQ9Ik03NTAuNzYgMTI2Mi43N0M3NDcuMTU4IDEyNjMuMTUgNzMyLjE1MiAxMjY2LjQ5IDcyNy4xMiAxMjY3LjU3QzcyMS43MDggMTI2OS4wMSA2NzIuMzc4IDEzMDcuMTEgNjY5LjEyNyAxMzE2LjQ4QzY2OC40MDcgMTMxOS43MyA2NjguMDU2IDEzMjQuNyA2NjguMDU2IDEzMjkuMzdMNjY3LjcwNSAxMzM2LjkyQzY2Ny43MDUgMTM0Mi4zMyA2NjkuMTkyIDEzNTEuMDEgNjY5LjkxMiAxMzU1LjcyQzY3My4xNDQgMTM1Ni40MyA2OTYuNjA5IDEzNTUuODEgNzAwLjk0IDEzNTYuNTNMNzAwLjQxNCAxMzY2LjE5QzY5Ni4xOTMgMTM2NS44OSA2NjYuMzg1IDEzNjUuOTggNjQ5LjM3NSAxMzY1Ljk4QzY0MC43MTMgMTM2NS45OCA2MTIuOTQ1IDEzNjYuOTEgNjA0LjQwMyAxMzY2LjY1TDYwNi4wMTkgMTM1Ny40NkM2MTAuNzAxIDEzNTcuMDkgNjMwLjA2NiAxMzU4LjI5IDYzNC4zMzIgMTM1My44QzYzNi40NDcgMTM1MS41NiA2MzUuNzgyIDEzNDkuMTggNjM1Ljc4MiAxMzM2LjIyVjEzMzAuMDlDNjM1Ljc4MiAxMzI3LjE5IDYzNS43ODIgMTMyMS44MiA2MzUuMDYxIDEzMTYuNzhDNjMzLjI1MSAxMzExLjM4IDU4OS44MDMgMTI1Ny4xNCA1NzguNjM5IDEyNDguNDlDNTc1LjQyNSAxMjQ3LjQxIDU1NS4xIDEyNDUuMzkgNTUwLjA2OCAxMjQ0LjNMNTQ5LjgxOCAxMjM2LjAxQzU1Mi4zMTIgMTIzNC43MyA1NzQuODk5IDEyMzYuMzEgNTk2LjgxMiAxMjM1LjVDNjExLjIyNyAxMjM0Ljk3IDY0NC4wODMgMTIzNS41IDY0OC4xMzcgMTIzNS45OEw2NDcuMTAzIDEyNDMuM0M2NDIuNzYzIDEyNDQuMzggNjIxLjk3NiAxMjQ0Ljc3IDYxNi41NjUgMTI0Ni4yMUM2MzAuNjAxIDEyNjcuMDggNjUyLjgyOCAxMjkzLjk3IDY2MC4wMDQgMTMwNC40MUM2NjMuOTY1IDEyOTguNjYgNjk4Ljc4OCAxMjc0LjcyIDY5OS44NzggMTI2Ni40NUM2OTQuNDU3IDEyNjUuMzcgNjc2LjU3IDEyNjIuNzcgNjczLjY5OCAxMjYyLjc3TDY3MS45OSAxMjUzLjM1QzY3Ni44ODQgMTI1Mi41OCA3MDIuNjc2IDEyNTMuMzUgNzE1LjQ4NCAxMjUzLjM1QzcyNi41NDcgMTI1My4zNSA3NTAuMTc4IDEyNTMuMzUgNzU2Ljg5MSAxMjUzLjkxTDc1MC43NiAxMjYyLjc3WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTExNTQuMjIgMTI4NS44MkwxMTQ3LjUgMTMzMUwxMTAwLjkzIDEzOTkuMjRMMTExNi42NSAxMzkwLjU1TDE0MjAuNDYgMTIyMy4yTDExNTQuMjIgMTI4NS44MlpNMTE1Mi42NiAxMjczLjgxTDEzNTMuNDcgMTIyOC4xTDEzNDAuNDMgMTIyNi4zNEwxMDI5LjQ2IDExODMuMjRMMTE1MC42MyAxMjcyLjQ0TDExNTIuNjYgMTI3My44MVoiIGZpbGw9InVybCgjcGFpbnQxX2xpbmVhcl80MzhfOTUpIi8+CjxwYXRoIGQ9Ik05MjkuMDU3IDg3Ni4wNjRDOTI1LjE4NyA4ODAuNDMyIDkyMC4zNTMgODgzLjM0MyA5MTUuNTI3IDg4NS43N0M5MTAuNjkzIDg4Ny43MSA5MDQuODk2IDg4OS4xNjYgODk5LjU3NiA4ODkuNjUxQzg5Ny42NDEgODg5LjY1MSA4OTYuMTkyIDg4OS42NTEgODk0LjI2NSA4ODkuMTY2SDg5Mi44MTVDODkxLjM2NiA4ODguNjgxIDg4OS45MDkgODg4LjY4MSA4ODguNDYgODg4LjE5NUg4ODcuOTgyQzg4Ni41MyA4ODcuNzEgODg0LjU5NyA4ODYuNzM5IDg4My4xNDggODg2LjI1NUM4ODIuNjY1IDg4Ni4yNTUgODgyLjY2NCA4ODUuNzcgODgyLjE4MSA4ODUuNzdDODgxLjIxNSA4ODQuNzk5IDg3OS43NjUgODg0LjMxNCA4NzguMzE2IDg4My4zNDNDODc4LjMxNiA4ODIuODU3IDg3Ny44MzIgODgyLjg1OCA4NzcuODMyIDg4Mi44NThDODc0LjkzMyA4ODAuNDMyIDg3Mi4wMzQgODc4LjQ5IDg2OS42MTggODc1LjU3OUw4NjkuNjE0IDg3NS41NzRDODY3LjE5OSA4NzIuNjY1IDg2NC43ODQgODY5Ljc1NSA4NjMuMzM2IDg2Ni4zNTlINzU2LjA2TDczNS4yODEgNzA4LjY1Nkw2NTQuMSAxMDE4LjI0SDYxNi40MDlMNTc5LjIgODYwLjA1MUg1MDguMTY2VjgyMy42NThINjA3LjcxTDYzNS43MzcgOTQzLjk5OEw3MjIuNzE4IDYwNy4yNEg3NjEuMzc1TDc4OC40MzYgODI5Ljk2Nkg4NjMuODE4Qzg2NS43NTIgODI2LjU3IDg2Ny42ODUgODIzLjY1OCA4NzAuMTAxIDgyMC43NDdDODcyLjUxNyA4MTcuODM1IDg3NS40MTYgODE1LjQwOSA4NzguMzE2IDgxMy40NjhDODc4LjMxNiA4MTIuOTgzIDg3OC43OTggODEyLjk4MyA4NzguNzk4IDgxMi45ODNDODc5Ljc2NSA4MTIuMDEzIDg4MS4yMTUgODExLjA0MiA4ODIuNjY0IDgxMC41NTdDODgzLjE0OCA4MTAuNTU3IDg4My4xNDcgODEwLjA3MSA4ODMuNjMgODEwLjA3MUM4ODUuMDgxIDgwOS4xMDEgODg3LjAxIDgwOC42MTYgODg4LjQ2IDgwOC4xMzFIODg4Ljk0NUM4OTAuMzk1IDgwNy42NDUgODkxLjg0NCA4MDcuMTYgODkzLjI5MyA4MDcuMTZIODk0Ljc0M0M5MDAuNTQgODA2LjY3NSA5MDUuODYgODA3LjE2IDkxMS4xNzEgODA4LjYxNkM5MTYuNDkxIDgxMC4wNzEgOTIxLjMyNCA4MTIuOTgzIDkyNS42NzIgODE2LjM4QzkzMC4wMjEgODIwLjI2MiA5MzMuNDA1IDgyNC42MjkgOTM1LjgxOCA4MjkuNDgxQzkzOC4yMzkgODM0LjMzMyA5MzkuNjg4IDgzOS42NzEgOTQwLjE2NiA4NDUuNDk1Qzk0MC4xNjYgODUwLjgzMiA5MzkuNjg4IDg1Ni42NTUgOTM3Ljc1MyA4NjEuOTkzQzkzNS44MTggODY3LjMzIDkzMi45MTkgODcyLjE4MiA5MjkuMDU3IDg3Ni4wNjRaIiBmaWxsPSIjMDA5RkMxIi8+CjxwYXRoIGQ9Ik0xNDYxLjk0IDgyMi43NzdDMTQ2MS45NiA4MTkuNDg3IDE0NjAuMjYgODE2LjQyNCAxNDU3LjQ1IDgxNC43MDNIMTQ1Ny40TDE0NTcuMjIgODE0LjYwNUwxMzExLjE3IDcyOC4yODFDMTMxMC41NCA3MjcuODU1IDEzMDkuODggNzI3LjQ2NiAxMzA5LjIxIDcyNy4xMTZDMTMwMy41NyA3MjQuMjExIDEyOTYuODcgNzI0LjIxMSAxMjkxLjIzIDcyNy4xMTZDMTI5MC41NSA3MjcuNDY3IDEyODkuOSA3MjcuODU1IDEyODkuMjcgNzI4LjI4MUwxMTQzLjIxIDgxNC42MDVMMTE0My4wNCA4MTQuNzAzQzExMzguNTcgODE3LjQ3NSAxMTM3LjIxIDgyMy4zMzUgMTEzOS45OCA4MjcuNzkyQzExNDAuOCA4MjkuMTA1IDExNDEuOTMgODMwLjE5OSAxMTQzLjI2IDgzMC45NzlMMTI4OS4zMiA5MTcuMzA0QzEyODkuOTUgOTE3LjcyNSAxMjkwLjYxIDkxOC4xMTQgMTI5MS4yOCA5MTguNDY4QzEyOTYuOTIgOTIxLjM3MyAxMzAzLjYyIDkyMS4zNzMgMTMwOS4yNiA5MTguNDY4QzEzMDkuOTMgOTE4LjExNCAxMzEwLjU4IDkxNy43MjYgMTMxMS4yMiA5MTcuMzA0TDE0NTcuMjcgODMwLjk3OUMxNDYwLjE5IDgyOS4yODEgMTQ2MS45NyA4MjYuMTUgMTQ2MS45NCA4MjIuNzc3WiIgZmlsbD0iIzBBMjc2NyIvPgo8cGF0aCBkPSJNMTE1OS41NyA3NjUuOTk1SDEyNTUuNTVWODUzLjY2NkgxMTU5LjU3Vjc2NS45OTVaTTE0NDIuMDUgNjc2Ljg3NVY2MzYuNzcxQzE0NDIuMjggNjI2Ljc0NCAxNDM0LjMxIDYxOC40MjcgMTQyNC4yNSA2MTguMTg3SDExNzUuMThDMTE2NS4xMiA2MTguNDI3IDExNTcuMTYgNjI2Ljc0NCAxMTU3LjM5IDYzNi43NzFWNjc2Ljg3NUwxMzA0LjYyIDcxNi4wMDFMMTQ0Mi4wNSA2NzYuODc1WiIgZmlsbD0iIzAzNjRCOCIvPgo8cGF0aCBkPSJNMTE1Ny4zOCA2NzUuNzQ4SDEyNTYuODFWNzY0LjcwN0gxMTU3LjM4VjY3NS43NDhaIiBmaWxsPSIjMDA3OEQ0Ii8+CjxwYXRoIGQ9Ik0xMzU0LjMgNjc1Ljc0OEgxMjU2LjgxVjc2NC43MDdMMTM1NC4zIDg1My42NjZIMTQ0Mi4wNVY3NjQuNzA3TDEzNTQuMyA2NzUuNzQ4WiIgZmlsbD0iIzI4QThFQSIvPgo8cGF0aCBkPSJNMTI1Ni44MSA3NjQuNzA3SDEzNTQuMTRWODUzLjY2NkgxMjU2LjgxVjc2NC43MDdaIiBmaWxsPSIjMDA3OEQ0Ii8+CjxwYXRoIGQ9Ik0xMjU2LjgxIDg1My42NjZIMTM1NC4xNFY5NDAuNTMySDEyNTYuODFWODUzLjY2NloiIGZpbGw9IiMwMzY0QjgiLz4KPHBhdGggZD0iTTExNjAuNTIgODUzLjY2NkgxMjU2LjgxVjkzMy4yMDZIMTE2MC41MlY4NTMuNjY2WiIgZmlsbD0iIzE0NDQ3RCIvPgo8cGF0aCBkPSJNMTM1NC4xNCA4NTMuNjY2SDE0NDIuMDVWOTQwLjUzMkgxMzU0LjE0Vjg1My42NjZaIiBmaWxsPSIjMDA3OEQ0Ii8+CjxwYXRoIGQ9Ik0xNDU3LjQ1IDgzMC45NDlMMTQ1Ny4yNiA4MzEuMDQ3TDEzMTEuMjUgOTEyLjc0OUMxMzEwLjYxIDkxMy4xMzkgMTMwOS45NiA5MTMuNTA5IDEzMDkuMjkgOTEzLjg0MUMxMzA2LjgxIDkxNS4wMTYgMTMwNC4xMSA5MTUuNjc5IDEzMDEuMzcgOTE1Ljc5MUwxMjkzLjM5IDkxMS4xNUMxMjkyLjcyIDkxMC44MTMgMTI5Mi4wNiA5MTAuNDM5IDEyOTEuNDMgOTEwLjAyOUwxMTQzLjQ1IDgyNi4wMDZIMTE0My4zOUwxMTM4LjU0IDgyMy4zMTVWOTg4LjcwOUMxMTM4LjYyIDk5OS43NDMgMTE0Ny42NyAxMDA4LjYzIDExNTguNzYgMTAwOC41NkgxNDQyLjAzQzE0NDIuMiAxMDA4LjU2IDE0NDIuMzUgMTAwOC40OCAxNDQyLjUyIDEwMDguNDhDMTQ0NC44NyAxMDA4LjMzIDE0NDcuMTggMTAwNy44NSAxNDQ5LjM4IDEwMDcuMDZDMTQ1MC4zNCAxMDA2LjY2IDE0NTEuMjYgMTAwNi4xOCAxNDUyLjE0IDEwMDUuNjNDMTQ1Mi43OSAxMDA1LjI2IDE0NTMuOTIgMTAwNC40NSAxNDUzLjkyIDEwMDQuNDVDMTQ1OC45NCAxMDAwLjc2IDE0NjEuOTEgOTk0LjkyMiAxNDYxLjk0IDk4OC43MDlWODIzLjMxNUMxNDYxLjkzIDgyNi40NzkgMTQ2MC4yMiA4MjkuMzk2IDE0NTcuNDUgODMwLjk0OVoiIGZpbGw9InVybCgjcGFpbnQyX2xpbmVhcl80MzhfOTUpIi8+CjxwYXRoIG9wYWNpdHk9IjAuNSIgZD0iTTE0NTQuNjEgODIyLjYwNlY4MzIuODQzTDEzMDEuODcgOTM4LjQzOUwxMTQzLjczIDgyNi4wNTFDMTE0My43MyA4MjUuOTk3IDExNDMuNjkgODI1Ljk1MyAxMTQzLjYzIDgyNS45NTNMMTEyOS4xMiA4MTcuMTkxVjgwOS44MDhMMTEzNS4xMSA4MDkuNzFMMTE0Ny43NSA4MTYuOTk1TDExNDguMDUgODE3LjA5M0wxMTQ5LjEyIDgxNy43ODJDMTE0OS4xMiA4MTcuNzgyIDEyOTcuNzUgOTAyLjkzMiAxMjk4LjE0IDkwMy4xMjlMMTMwMy44MyA5MDYuNDc1QzEzMDQuMzIgOTA2LjI3OCAxMzA0LjgxIDkwNi4wODIgMTMwNS40IDkwNS44ODVDMTMwNS42OSA5MDUuNjg4IDE0NTIuOTQgODIyLjUwNyAxNDUyLjk0IDgyMi41MDdMMTQ1NC42MSA4MjIuNjA2WiIgZmlsbD0iIzBBMjc2NyIvPgo8cGF0aCBkPSJNMTQ1Ny40NSA4MzAuOTQ5TDE0NTcuMjYgODMxLjA1N0wxMzExLjI1IDkxMi43NTlDMTMxMC42MSA5MTMuMTQ4IDEzMDkuOTYgOTEzLjUxOSAxMzA5LjI5IDkxMy44NUMxMzAzLjYxIDkxNi42MDcgMTI5Ni45OCA5MTYuNjA3IDEyOTEuMzEgOTEzLjg1QzEyOTAuNjQgOTEzLjUyIDEyODkuOTkgOTEzLjE1NSAxMjg5LjM1IDkxMi43NTlMMTE0My4zNCA4MzEuMDU3TDExNDMuMTYgODMwLjk0OUMxMTQwLjM0IDgyOS40MjkgMTEzOC41NyA4MjYuNTA2IDExMzguNTQgODIzLjMxNVY5ODguNzA5QzExMzguNjIgOTk5Ljc0MSAxMTQ3LjY2IDEwMDguNjMgMTE1OC43NSAxMDA4LjU2QzExNTguNzUgMTAwOC41NiAxMTU4Ljc1IDEwMDguNTYgMTE1OC43NSAxMDA4LjU2SDE0NDEuNzNDMTQ1Mi44MiAxMDA4LjYzIDE0NjEuODcgOTk5Ljc0MiAxNDYxLjk0IDk4OC43MDlDMTQ2MS45NCA5ODguNzA5IDE0NjEuOTQgOTg4LjcwOSAxNDYxLjk0IDk4OC43MDlWODIzLjMxNUMxNDYxLjkzIDgyNi40NzkgMTQ2MC4yMiA4MjkuMzk2IDE0NTcuNDUgODMwLjk0OVoiIGZpbGw9IiMxNDkwREYiLz4KPHBhdGggb3BhY2l0eT0iMC4xIiBkPSJNMTMxMy42MiA5MTIuMjc0TDEzMTEuNDQgOTEzLjQ5NkMxMzEwLjgxIDkxMy44OTggMTMxMC4xNiA5MTQuMjY3IDEzMDkuNDkgOTE0LjZDMTMwNy4wOSA5MTUuNzc4IDEzMDQuNDggOTE2LjQ2OSAxMzAxLjgxIDkxNi42MzJMMTM1Ny4xNiA5ODIuMTM2TDE0NTMuNzIgMTAwNS40MkMxNDU2LjM3IDEwMDMuNDIgMTQ1OC40NyAxMDAwLjc5IDE0NTkuODQgOTk3Ljc2OUwxMzEzLjYyIDkxMi4yNzRaIiBmaWxsPSJibGFjayIvPgo8cGF0aCBvcGFjaXR5PSIwLjA1IiBkPSJNMTMyMy41MiA5MDcuMDQxTDEzMTEuNDYgOTEzLjc5MkMxMzEwLjgyIDkxNC4xOTMgMTMxMC4xNyA5MTQuNTYxIDEzMDkuNSA5MTQuODkzQzEzMDcuMSA5MTYuMDY4IDEzMDQuNDggOTE2Ljc1NyAxMzAxLjgxIDkxNi45MkwxMzI3Ljc5IDk4OC4yNjNMMTQ1NC4wMyAxMDA1LjQyQzE0NTkuMDEgMTAwMS43IDE0NjEuOTMgOTk1Ljg2OSAxNDYxLjk0IDk4OS42NzVWOTg3LjU0MkwxMzIzLjUyIDkwNy4wNDFaIiBmaWxsPSJibGFjayIvPgo8cGF0aCBkPSJNMTE1OS4wMSAxMDA4LjU2SDE0NDEuNDdDMTQ0NS44MiAxMDA4LjU4IDE0NTAuMDYgMTAwNy4yMSAxNDUzLjU2IDEwMDQuNjZMMTI5My4yNiA5MTEuMTdDMTI5Mi41OSA5MTAuODMzIDEyOTEuOTQgOTEwLjQ1OSAxMjkxLjMxIDkxMC4wNDlMMTE0My40NCA4MjYuMDI2SDExNDMuMzdMMTEzOC41NCA4MjMuMzE1Vjk4OC4xNDNDMTEzOC41MyA5OTkuNDA4IDExNDcuNyAxMDA4LjU1IDExNTkuMDEgMTAwOC41NkMxMTU5LjAxIDEwMDguNTYgMTE1OS4wMSAxMDA4LjU2IDExNTkuMDEgMTAwOC41NloiIGZpbGw9IiMyOEE4RUEiLz4KPHBhdGggb3BhY2l0eT0iMC4xIiBkPSJNMTI3NS42NSA3MTMuNTg3VjkyMi41MDlDMTI3NS42MyA5MjkuODM0IDEyNzEuMTggOTM2LjQxOCAxMjY0LjM4IDkzOS4xNkMxMjYyLjI4IDk0MC4wNjQgMTI2MC4wMSA5NDAuNTMxIDEyNTcuNzMgOTQwLjUzMUgxMTM4LjU0VjcwNS40MjdIMTE1OC4xM1Y2OTUuNjMzSDEyNTcuNzNDMTI2Ny42MiA2OTUuNjcgMTI3NS42MiA3MDMuNjkxIDEyNzUuNjUgNzEzLjU4N1oiIGZpbGw9ImJsYWNrIi8+CjxwYXRoIG9wYWNpdHk9IjAuMiIgZD0iTTEyNjYuMjMgNzI0LjA1NVY5MzMuMDAyQzEyNjYuMjUgOTM1LjM2OSAxMjY1Ljc1IDkzNy43MTEgMTI2NC43NSA5MzkuODU5QzEyNjIuMDMgOTQ2LjU2NSAxMjU1LjUxIDk1MC45NjQgMTI0OC4yNSA5NTAuOTk3SDExMzguNTRWNzA2LjA5OUgxMjQ4LjI1QzEyNTEuMSA3MDYuMDcxIDEyNTMuOTEgNzA2Ljc4IDEyNTYuNCA3MDguMTU3QzEyNjIuNDMgNzExLjE4MiAxMjY2LjIyIDcxNy4zMzEgMTI2Ni4yMyA3MjQuMDU1WiIgZmlsbD0iYmxhY2siLz4KPHBhdGggb3BhY2l0eT0iMC4yIiBkPSJNMTI2Ni4yMyA3MjQuMDMyVjkxMy4xNDFDMTI2Ni4xOCA5MjMuMDIgMTI1OC4xNyA5MzEuMDI3IDEyNDguMjUgOTMxLjExMkgxMTM4LjU0VjcwNi4wOTlIMTI0OC4yNUMxMjUxLjEgNzA2LjA3MSAxMjUzLjkxIDcwNi43NzkgMTI1Ni40MSA3MDguMTU0QzEyNjIuNDMgNzExLjE3NSAxMjY2LjIyIDcxNy4zMTcgMTI2Ni4yMyA3MjQuMDMyWiIgZmlsbD0iYmxhY2siLz4KPHBhdGggb3BhY2l0eT0iMC4yIiBkPSJNMTI1Ni44MSA3MjQuMDMxVjkxMy4xNDFDMTI1Ni44IDkyMy4wMzUgMTI0OC43NCA5MzEuMDY0IDEyMzguNzcgOTMxLjExMkgxMTM4LjU0VjcwNi4wOTlIMTIzOC43N0MxMjQ4Ljc0IDcwNi4xMDQgMTI1Ni44MSA3MTQuMTI4IDEyNTYuODEgNzI0LjAyMkMxMjU2LjgxIDcyNC4wMjUgMTI1Ni44MSA3MjQuMDI4IDEyNTYuODEgNzI0LjAzMVoiIGZpbGw9ImJsYWNrIi8+CjxwYXRoIGQ9Ik0xMDU4LjIyIDcwNi4wOTlIMTIzOC43NkMxMjQ4LjczIDcwNi4wOTkgMTI1Ni44MSA3MTQuMTAyIDEyNTYuODEgNzIzLjk3NFY5MDIuNzcxQzEyNTYuODEgOTEyLjY0MyAxMjQ4LjczIDkyMC42NDcgMTIzOC43NiA5MjAuNjQ3SDEwNTguMjJDMTA0OC4yNSA5MjAuNjQ3IDEwNDAuMTcgOTEyLjY0MyAxMDQwLjE3IDkwMi43NzFWNzIzLjk3NEMxMDQwLjE3IDcxNC4xMDIgMTA0OC4yNSA3MDYuMDk5IDEwNTguMjIgNzA2LjA5OVoiIGZpbGw9InVybCgjcGFpbnQzX2xpbmVhcl80MzhfOTUpIi8+CjxwYXRoIGQ9Ik0xMDk2LjMzIDc4MC44MUMxMTAwLjc2IDc3MS40MTEgMTEwNy45IDc2My41NDUgMTExNi44NSA3NTguMjI0QzExMjYuNzUgNzUyLjU3MSAxMTM4LjAzIDc0OS43NTMgMTE0OS40NCA3NTAuMDhDMTE2MC4wMiA3NDkuODUyIDExNzAuNDUgNzUyLjUyMyAxMTc5LjYxIDc1Ny44MDRDMTE4OC4yMSA3NjIuOTIgMTE5NS4xNSA3NzAuNDE3IDExOTkuNTYgNzc5LjM4NEMxMjA0LjM3IDc4OS4yNjUgMTIwNi43NyA4MDAuMTM5IDEyMDYuNTYgODExLjExOUMxMjA2Ljc5IDgyMi41OTUgMTIwNC4zMiA4MzMuOTY1IDExOTkuMzYgODQ0LjMxOUMxMTk0LjgzIDg1My42MDcgMTE4Ny42OCA4NjEuMzcxIDExNzguNzggODY2LjY1MUMxMTY5LjI3IDg3Mi4wOTMgMTE1OC40NSA4NzQuODM1IDExNDcuNDkgODc0LjU4QzExMzYuNjkgODc0Ljg0IDExMjYuMDMgODcyLjEzOCAxMTE2LjY2IDg2Ni43NjhDMTEwNy45OCA4NjEuNjQ1IDExMDAuOTYgODU0LjE0IDEwOTYuNDQgODQ1LjE0OUMxMDkxLjYgODM1LjQxMSAxMDg5LjE4IDgyNC42NTkgMTA4OS4zNyA4MTMuNzk1QzEwODkuMTcgODAyLjQxNyAxMDkxLjU1IDc5MS4xNDEgMTA5Ni4zMyA3ODAuODFaTTExMTguMiA4MzMuODMyQzExMjAuNTYgODM5Ljc3NCAxMTI0LjU2IDg0NC45MjcgMTEyOS43NCA4NDguNjk0QzExMzUuMDIgODUyLjM2OSAxMTQxLjMzIDg1NC4yNjUgMTE0Ny43NyA4NTQuMTA0QzExNTQuNjIgODU0LjM3NCAxMTYxLjM3IDg1Mi40MTMgMTE2Ny4wMSA4NDguNTE4QzExNzIuMTIgODQ0Ljc2MyAxMTc2LjAyIDgzOS41OTYgMTE3OC4yMSA4MzMuNjU2QzExODAuNjcgODI3LjAyMyAxMTgxLjg4IDgxOS45OTYgMTE4MS43OSA4MTIuOTI2QzExODEuODcgODA1Ljc4OCAxMTgwLjczIDc5OC42ODkgMTE3OC40MiA3OTEuOTMyQzExNzYuMzggNzg1LjgzIDExNzIuNjEgNzgwLjQ1IDExNjcuNTcgNzc2LjQ0NUMxMTYyLjA3IDc3Mi4zNjYgMTE1NS4zNCA3NzAuMjk2IDExNDguNDkgNzcwLjU4NkMxMTQxLjkyIDc3MC40MTYgMTEzNS40NiA3NzIuMzI3IDExMzAuMDQgNzc2LjA0NUMxMTI0Ljc4IDc3OS44MjcgMTEyMC43IDc4NS4wMjYgMTExOC4yOSA3OTEuMDMzQzExMTIuOTQgODA0LjgwMyAxMTEyLjkxIDgyMC4wNjMgMTExOC4yMSA4MzMuODUxTDExMTguMiA4MzMuODMyWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTEzNTQuMTQgNjc1Ljc0OEgxNDQyLjA1Vjc2NC43MDdIMTM1NC4xNFY2NzUuNzQ4WiIgZmlsbD0iIzUwRDlGRiIvPgo8cGF0aCBkPSJNMTQwLjI0MiAxODMuODQ5SDBWMzI0LjA5VjQ2NC4zMzRIMTQwLjI0MkgyODAuNDgzVjMyNC4wOVYxODMuODQ5SDE0MC4yNDJaIiBmaWxsPSIjOURFMUYzIi8+CjxwYXRoIGQ9Ik0xNDAuMjQ2IDQzLjYwNjRWMTgzLjg0OFYzMjQuMDlIMjgwLjQ4OEg0MjAuNzI5VjQzLjYwNjRIMTQwLjI0NloiIGZpbGw9IiMyN0I0RTEiLz4KPHBhdGggZD0iTTAgNDY0LjMzM0gxNDAuMjQyVjMyNC4wOTJIMFY0NjQuMzMzWiIgZmlsbD0iIzFBODJFMiIvPgo8cGF0aCBkPSJNMjgwLjQ4NiAxODMuODQ4SDQyMC43MjhWNDMuNjA2NEgyODAuNDg2VjE4My44NDhaIiBmaWxsPSIjMUE4MkUyIi8+CjxwYXRoIGQ9Ik0xNDAuMjQ2IDMyNC4wOTFIMjgwLjQ4OFYxODMuODVIMTQwLjI0NlYzMjQuMDkxWiIgZmlsbD0iIzIzOUZENyIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDBfbGluZWFyXzQzOF85NSIgeDE9IjIwNi45NCIgeTE9IjEwMTUuMjkiIHgyPSIyMDcuMzM4IiB5Mj0iNjEzLjY5NSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjNzBFRkZGIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzU3NzBGRiIvPgo8L2xpbmVhckdyYWRpZW50Pgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MV9saW5lYXJfNDM4Xzk1IiB4MT0iMTUzNC43OSIgeTE9IjExMjYuODQiIHgyPSIxMjQ2LjQzIiB5Mj0iMTUwOS4wNiIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjRkZCQzQ4Ii8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0ZGQTQxNCIvPgo8L2xpbmVhckdyYWRpZW50Pgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50Ml9saW5lYXJfNDM4Xzk1IiB4MT0iMTMwMC4yNCIgeTE9IjgyMy4zMTUiIHgyPSIxMzAwLjI0IiB5Mj0iMTAwOC41NiIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjMzVCOEYxIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzI4QThFQSIvPgo8L2xpbmVhckdyYWRpZW50Pgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50M19saW5lYXJfNDM4Xzk1IiB4MT0iMTA3Ny44IiB5MT0iNjkyLjEzMSIgeDI9IjEyMTcuMTIiIHkyPSI5MzUuNzg2IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiMxNzg0RDkiLz4KPHN0b3Agb2Zmc2V0PSIwLjUiIHN0b3AtY29sb3I9IiMxMDdBRDUiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMEE2M0M5Ii8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+Cg==",
    longDescriptionMD: `
## How to use

This plugin alows to send notifications on behalf of one of popular supported email providers. To see full list scroll down to setting "Email provider".

This plugin does not provide how to get credentials for each provider hovewer you can Google it by using "Nodemailer <provider>".
E.g. by googling Nodemailer mailgun you can find this answer https://stackoverflow.com/a/29686158/3479125 So here user and pass are creds that you should pass into params below.


  `,
  supportedEvents: [
        'disk_is_almost_full',
        'disk_usage_recovered',
        'host_is_offline',
        'host_is_online',
        'ram_is_almost_full',
        'ram_usage_recovered',
  ],

  params: [
        {
          id: "provider",
          name: "Email provider",
          required: true,
          values: servicesList.map(s => ({ value: s, label: s })),
          type: "dropdown"
        },
        {
            id: "username",
            name: "E-mail address or username of email account",
            notes: "Example: mymail@example-provider.com",
            required: true,
            type: "str"
        },
        {
          id: "password",
          name: "Password for your email account",
          required: true,
          type: "str"
        },
        {
          id: "notify_emails",
          name: "Email on which you want to receive notifications",
          notes: "Could be one email address or multiple defined via comma, e.g. 'one@devforth.io, two@devforth.io'",
          required: true,
          type: "str"
        },
        {
            id: "disk_is_almost_full_message",
            name: "What message will be shown when you get disk_is_almost_full alert",
            default_value: "⚠️ {{ HOST_NAME }}: Disk is almost full ({{ HOST_PUBLIC_IP }}) \n {  {DISK_USED}} / {{DISK_TOTAL}}. Please clean it up",
            required: false,
            type: "text",
        },
        {
            id: "disk_usage_recovered_message",
            name: "What message will be shown when you get disk_usage_recovered alert",
            default_value: "👌🏼 {{ HOST_NAME }}: Disk usage recovered\n Now it is used {{DISK_USED}  } / {{DISK_TOTAL}}. Time require to fix: {{ alertDuration this.DISK_ISSUE }}",
            required: false,
            type: "text",
        },
        {
            id: "host_is_offline_message",
            name: "What message will be shown when you get host_is_offline alert",
            default_value: "⚠️ {{ HOST_NAME }}: Host is offline",
            required: false,
            type: "text",
        },
        {
            id: "host_is_online_message",
            name: "What message will be shown when you get host_is_online_message alert",
            default_value: "👌🏼 {{ HOST_NAME }}: Host back online, Downtime: {{ alertDuration this.  ONLINE_ISSUE }}",
            required: false,
            type: "text",
        },
        {
            id: "ram_is_almost_full_message",
            name: "What message will be shown when you get ram_is_almost_full alert",
            default_value: "⚠️ {{ HOST_NAME }}: RAM is almost full\n Now it is {{ RAM_USED }} / {{   RAM_TOTAL }}",
            required: false,
            type: "text",
        },
        {
            id: "ram_usage_recovered_message",
            name: "What message will be shown when you get ram_usage_recovered alert",
            default_value: "👌🏼 {{ HOST_NAME }}: RAM usage recovered\n Now it is {{ RAM_USED }} / {  { RAM_TOTAL }}. Time require to fix: {{ alertDuration this.RAM_ISSUE }}",
            required: false,
            type: "text",
        },
  ],

  configuration: {},

  async onPluginEnabled() {
    this.hbs = hbs.create();
    this.hbs.registerHelper('alertDuration', (lastAlert) => {
      const now = new Date().getTime();
      let time = (now - lastAlert) / 1000;
  
      const interval = {
        days: '',
        hours: '',
        minutes: '',
        seconds: '',
      }
  
      interval.days = Math.floor(time/(3600 * 24)) + ' days ';
      time %= 3600 * 24
      interval.hours = Math.floor(time / 3600) + ' hours ';
      time %= 3600;
      interval.minutes = Math.floor(time / 60) + ' minutes ';
      interval.seconds = (time % 60).toFixed(0) + ' seconds ';
  
      return Object.keys(interval).reduce((prev, cur) => {
          const timeValue = interval[cur].split(' ')[0];
          if (timeValue && timeValue !== '0') {return prev + interval[cur]}
          return prev;
      }, '')
  }
  )
  },
  async onPluginDisable() {
  },
  async handleEvent({ eventType, data, settings }) {
    const template = this.hbs.compile(settings.params[`${eventType}_message`]);
    const text = template(data);

    const { username, password, provider, notify_emails } = settings.params;
    
    const transporter = nodemailer.createTransport({
      service: provider,
      auth: {
        user: username,
        pass: password,
      },
    });
    await transporter.sendMail({
      from: `"HotHost 🔥" <${username}>`, // sender address
      to: notify_emails, // list of receivers
      subject: text.slice(0, 60) + '...', // Subject line
      text: text, // plain text body
    });
  },
};
