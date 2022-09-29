FROM ubuntu as psbuilder
RUN apt-get update && apt-get -y install build-essential gettext autoconf pkg-config \
  gcc make git autopoint libtool
RUN apt-get install -y libtool-bin
RUN git clone https://gitlab.com/procps-ng/procps.git
WORKDIR /procps
RUN git checkout v3.3.17 && find . \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i 's|"/proc|"/host/proc|g' &&\
find . \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i 's|void look_up_our_self(proc_t \*p) {|void look_up_our_self(proc_t *p) {return 1; }; int a12(proc_t *p) { |g' &&\
./autogen.sh &&\
LDFLAGS=-static ./configure --without-ncurses

RUN make

FROM ubuntu
COPY --from=psbuilder /procps/ps/pscommand /pscommand

RUN apt-get update && apt-get install bash curl procps
ADD getinfo.sh .

CMD [ "bash", "getinfo.sh" ]