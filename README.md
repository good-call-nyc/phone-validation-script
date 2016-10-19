# phone-validation-script

goes through a text file of email addresses, and shows which ones are valid / invalid

## install

```bash
git clone https://github.com/good-call-nyc/phone-validation-script.git
cd phone-validation-script
npm link
```

## usage

```bash
phone-validation-script <input-file.txt>
```

where `input-file.txt` is a list of `\n`-delimited phone numbers,

places all valid and invalid phone addresses in `valid-phones.txt` and `invalid-phones.txt` respectively
